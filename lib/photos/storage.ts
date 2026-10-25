import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { StoredPhoto } from "./types";

export const MAX_PHOTOS_PER_UPLOAD = 20;
export const MAX_PHOTO_BYTES = 20 * 1024 * 1024;
export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

const MAX_INPUT_PIXELS = 40_000_000;
const MAX_OUTPUT_EDGE = 3200;
const SUPPORTED_IMAGE_TYPES = new Set([
  "image/avif",
  "image/heic",
  "image/heif",
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/webp",
]);
const SUPPORTED_IMAGE_EXTENSIONS = /\.(?:avif|heic|heif|jpe?g|png|tiff?|webp)$/i;
const HEIC_IMAGE_EXTENSIONS = /\.(?:heic|heif)$/i;

type PreparedPhoto = StoredPhoto & { data: Buffer };

function isHeicFile(file: File) {
  return file.type === "image/heic" || file.type === "image/heif" || HEIC_IMAGE_EXTENSIONS.test(file.name);
}

async function sharpInput(file: File, input: Buffer) {
  if (!isHeicFile(file)) {
    return sharp(input, {
      failOn: "error",
      limitInputPixels: MAX_INPUT_PIXELS,
    }).rotate();
  }

  // The prebuilt libvips binary understands AVIF but omits the patent-encumbered
  // HEVC decoder used by phone HEIC files. Decode those pixels with libheif-js,
  // then immediately pass raw RGBA data to sharp for sanitizing and re-encoding.
  const { default: decodeHeic } = await import("heic-decode");
  const decoded = await decodeHeic({ buffer: input });
  const pixelCount = decoded.width * decoded.height;
  if (!Number.isSafeInteger(pixelCount) || pixelCount <= 0 || pixelCount > MAX_INPUT_PIXELS) {
    throw new Error("Photo dimensions are too large");
  }

  return sharp(Buffer.from(decoded.data.buffer, decoded.data.byteOffset, decoded.data.byteLength), {
    raw: {
      width: decoded.width,
      height: decoded.height,
      channels: 4,
    },
    limitInputPixels: MAX_INPUT_PIXELS,
  });
}

function storageDirectory() {
  return process.env.PHOTO_STORAGE_DIR || "/tmp/viraj-computer-photos";
}

function safePhotoPath(fileName: string) {
  if (!/^[0-9a-f-]{36}\.webp$/.test(fileName)) {
    throw new Error("Invalid photo file name");
  }
  return path.join(/* turbopackIgnore: true */ storageDirectory(), fileName);
}

export function validatePhotoFiles(files: File[]) {
  if (files.length === 0) throw new Error("Select at least one photo");
  if (files.length > MAX_PHOTOS_PER_UPLOAD) {
    throw new Error(`Upload up to ${MAX_PHOTOS_PER_UPLOAD} photos at a time`);
  }

  let totalBytes = 0;
  for (const file of files) {
    if (!SUPPORTED_IMAGE_TYPES.has(file.type) && !SUPPORTED_IMAGE_EXTENSIONS.test(file.name)) {
      throw new Error(`${file.name || "A file"} is not a supported image`);
    }
    if (file.size > MAX_PHOTO_BYTES) {
      throw new Error(`${file.name || "A photo"} exceeds the 20 MB limit`);
    }
    totalBytes += file.size;
  }

  if (totalBytes > MAX_UPLOAD_BYTES) {
    throw new Error("The selected photos exceed the 100 MB upload limit");
  }
}

export async function preparePhoto(file: File): Promise<PreparedPhoto> {
  const id = randomUUID();
  const input = Buffer.from(await file.arrayBuffer());
  const { data, info } = await (await sharpInput(file, input))
    .resize({
      width: MAX_OUTPUT_EDGE,
      height: MAX_OUTPUT_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 88, effort: 4 })
    .toBuffer({ resolveWithObject: true });

  const metadata = await sharp(data).metadata();
  if (metadata.exif || metadata.icc || metadata.iptc || metadata.xmp) {
    throw new Error("Photo metadata could not be removed safely");
  }

  return {
    id,
    src: `/api/photos/${id}`,
    fileName: `${id}.webp`,
    width: info.width,
    height: info.height,
    createdAt: new Date().toISOString(),
    data,
  };
}

export async function writePreparedPhotos(photos: PreparedPhoto[]) {
  await mkdir(/* turbopackIgnore: true */ storageDirectory(), { recursive: true });
  const written: string[] = [];
  let temporary: string | null = null;

  try {
    for (const photo of photos) {
      const destination = safePhotoPath(photo.fileName);
      temporary = `${destination}.${randomUUID()}.tmp`;
      await writeFile(/* turbopackIgnore: true */ temporary, photo.data, {
        flag: "wx",
      });
      await rename(
        /* turbopackIgnore: true */ temporary,
        /* turbopackIgnore: true */ destination,
      );
      temporary = null;
      written.push(photo.fileName);
    }
  } catch (error) {
    if (temporary) {
      await unlink(/* turbopackIgnore: true */ temporary).catch(() => undefined);
    }
    await Promise.all(written.map((fileName) => deletePhotoFile(fileName)));
    throw error;
  }
}

export function photoRecords(photos: PreparedPhoto[]): StoredPhoto[] {
  return photos.map((photo) => ({
    id: photo.id,
    src: photo.src,
    fileName: photo.fileName,
    width: photo.width,
    height: photo.height,
    createdAt: photo.createdAt,
  }));
}

export async function readPhotoFile(fileName: string) {
  return readFile(/* turbopackIgnore: true */ safePhotoPath(fileName));
}

export async function deletePhotoFile(fileName: string) {
  try {
    await unlink(/* turbopackIgnore: true */ safePhotoPath(fileName));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}
