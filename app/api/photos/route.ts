import { NextResponse } from "next/server";
import { isEditAuthenticated } from "@/lib/auth/edit-session";
import {
  findPhotosByContentMd5,
  insertPhotos,
  listPhotos,
} from "@/lib/photos/repository";
import {
  deletePhotoFile,
  photoRecords,
  preparePhoto,
  validatePhotoFiles,
  writePreparedPhotos,
} from "@/lib/photos/storage";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(await listPhotos(), {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  try {
    if (!(await isEditAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData
      .getAll("photos")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);
    validatePhotoFiles(files);

    const prepared = [];
    const failures: Array<{ name: string; error: string }> = [];
    for (const file of files) {
      try {
        prepared.push(await preparePhoto(file));
      } catch (error) {
        const detail = error instanceof Error ? error.message.toLowerCase() : "";
        failures.push({
          name: file.name || "Unnamed photo",
          error: detail.includes("dimensions")
            ? "Photo dimensions are too large"
            : "This image could not be decoded",
        });
      }
    }

    if (prepared.length === 0) {
      return NextResponse.json(
        { error: "None of the selected photos could be processed", failures },
        { status: 422 },
      );
    }

    const existingByChecksum = await findPhotosByContentMd5(
      prepared.map((photo) => photo.contentMd5),
    );
    const duplicates = prepared.flatMap((photo) => {
      const existing = existingByChecksum.get(photo.contentMd5);
      return existing ? [existing] : [];
    });
    const newPhotos = prepared.filter(
      (photo) => !existingByChecksum.has(photo.contentMd5),
    );

    if (newPhotos.length === 0) {
      return NextResponse.json(
        { photos: [], duplicates, failures },
        { status: failures.length > 0 ? 207 : 200 },
      );
    }

    await writePreparedPhotos(newPhotos);
    const records = photoRecords(newPhotos);

    try {
      const result = await insertPhotos(records);
      const insertedIds = new Set(result.insertedIds);
      await Promise.all(
        records
          .filter((photo) => !insertedIds.has(photo.id))
          .map((photo) => deletePhotoFile(photo.fileName)),
      );
      return NextResponse.json(
        {
          photos: result.photos,
          duplicates: [...duplicates, ...result.duplicates],
          failures,
        },
        {
          status:
            failures.length > 0 ? 207 : result.photos.length > 0 ? 201 : 200,
        },
      );
    } catch (error) {
      await Promise.all(records.map((photo) => deletePhotoFile(photo.fileName)));
      throw error;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
