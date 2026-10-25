import { NextResponse } from "next/server";
import { isEditAuthenticated } from "@/lib/auth/edit-session";
import { insertPhotos, listPhotos } from "@/lib/photos/repository";
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

    await writePreparedPhotos(prepared);
    const records = photoRecords(prepared);

    try {
      const photos = await insertPhotos(records);
      return NextResponse.json(
        { photos, failures },
        { status: failures.length > 0 ? 207 : 201 },
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
