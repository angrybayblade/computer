import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { StoredSticker } from "./types";

export const MAX_STICKERS_PER_UPLOAD = 20;
export const MAX_STICKER_BYTES = 20 * 1024 * 1024;
export const MAX_STICKER_UPLOAD_BYTES = 100 * 1024 * 1024;

const MAX_INPUT_PIXELS = 40_000_000;
const MAX_OUTPUT_EDGE = 2000;
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

type PreparedSticker = StoredSticker & { data: Buffer };

function isHeicFile(file: File) {
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    HEIC_IMAGE_EXTENSIONS.test(file.name)
  );
}

async function sharpInput(file: File, input: Buffer) {
  if (!isHeicFile(file)) {
    return sharp(input, {
      failOn: "error",
      limitInputPixels: MAX_INPUT_PIXELS,
    }).rotate();
  }

  const { default: decodeHeic } = await import("heic-decode");
  const decoded = await decodeHeic({ buffer: input });
  const pixelCount = decoded.width * decoded.height;
  if (
    !Number.isSafeInteger(pixelCount) ||
    pixelCount <= 0 ||
    pixelCount > MAX_INPUT_PIXELS
  ) {
    throw new Error("Sticker dimensions are too large");
  }

  return sharp(
    Buffer.from(
      decoded.data.buffer,
      decoded.data.byteOffset,
      decoded.data.byteLength,
    ),
    {
      raw: {
        width: decoded.width,
        height: decoded.height,
        channels: 4,
      },
      limitInputPixels: MAX_INPUT_PIXELS,
    },
  );
}

function storageDirectory() {
  return process.env.STICKER_STORAGE_DIR || "/tmp/viraj-computer-stickers";
}

function safeStickerPath(fileName: string) {
  if (!/^[0-9a-f-]{36}\.webp$/.test(fileName)) {
    throw new Error("Invalid sticker file name");
  }
  return path.join(/* turbopackIgnore: true */ storageDirectory(), fileName);
}

export function validateStickerFiles(files: File[]) {
  if (files.length === 0) throw new Error("Select at least one sticker");
  if (files.length > MAX_STICKERS_PER_UPLOAD) {
    throw new Error(`Upload up to ${MAX_STICKERS_PER_UPLOAD} stickers at a time`);
  }

  let totalBytes = 0;
  for (const file of files) {
    if (
      !SUPPORTED_IMAGE_TYPES.has(file.type) &&
      !SUPPORTED_IMAGE_EXTENSIONS.test(file.name)
    ) {
      throw new Error(`${file.name || "A file"} is not a supported image`);
    }
    if (file.size > MAX_STICKER_BYTES) {
      throw new Error(`${file.name || "A sticker"} exceeds the 20 MB limit`);
    }
    totalBytes += file.size;
  }

  if (totalBytes > MAX_STICKER_UPLOAD_BYTES) {
    throw new Error("The selected stickers exceed the 100 MB upload limit");
  }
}

export async function prepareSticker(file: File): Promise<PreparedSticker> {
  const id = randomUUID();
  const input = Buffer.from(await file.arrayBuffer());
  const { data, info } = await (await sharpInput(file, input))
    .resize({
      width: MAX_OUTPUT_EDGE,
      height: MAX_OUTPUT_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ lossless: true, effort: 4 })
    .toBuffer({ resolveWithObject: true });

  const metadata = await sharp(data).metadata();
  if (metadata.exif || metadata.icc || metadata.iptc || metadata.xmp) {
    throw new Error("Sticker metadata could not be removed safely");
  }

  return {
    id,
    src: `/api/stickers/${id}`,
    fileName: `${id}.webp`,
    width: info.width,
    height: info.height,
    createdAt: new Date().toISOString(),
    data,
  };
}

export async function writePreparedStickers(stickers: PreparedSticker[]) {
  await mkdir(/* turbopackIgnore: true */ storageDirectory(), { recursive: true });
  const written: string[] = [];
  let temporary: string | null = null;

  try {
    for (const sticker of stickers) {
      const destination = safeStickerPath(sticker.fileName);
      temporary = `${destination}.${randomUUID()}.tmp`;
      await writeFile(/* turbopackIgnore: true */ temporary, sticker.data, {
        flag: "wx",
      });
      await rename(
        /* turbopackIgnore: true */ temporary,
        /* turbopackIgnore: true */ destination,
      );
      temporary = null;
      written.push(sticker.fileName);
    }
  } catch (error) {
    if (temporary) {
      await unlink(/* turbopackIgnore: true */ temporary).catch(() => undefined);
    }
    await Promise.all(written.map((fileName) => deleteStickerFile(fileName)));
    throw error;
  }
}

export function stickerRecords(stickers: PreparedSticker[]): StoredSticker[] {
  return stickers.map((sticker) => ({
    id: sticker.id,
    src: sticker.src,
    fileName: sticker.fileName,
    width: sticker.width,
    height: sticker.height,
    createdAt: sticker.createdAt,
  }));
}

export async function readStickerFile(fileName: string) {
  return readFile(/* turbopackIgnore: true */ safeStickerPath(fileName));
}

export async function deleteStickerFile(fileName: string) {
  try {
    await unlink(/* turbopackIgnore: true */ safeStickerPath(fileName));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}
