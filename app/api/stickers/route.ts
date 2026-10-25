import { NextResponse } from "next/server";
import { isEditAuthenticated } from "@/lib/auth/edit-session";
import { insertStickers, listStickers } from "@/lib/stickers/repository";
import {
  deleteStickerFile,
  prepareSticker,
  stickerRecords,
  validateStickerFiles,
  writePreparedStickers,
} from "@/lib/stickers/storage";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(await listStickers(), {
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
      .getAll("stickers")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);
    validateStickerFiles(files);

    const prepared = [];
    const failures: Array<{ name: string; error: string }> = [];
    for (const file of files) {
      try {
        prepared.push(await prepareSticker(file));
      } catch (error) {
        const detail = error instanceof Error ? error.message.toLowerCase() : "";
        failures.push({
          name: file.name || "Unnamed sticker",
          error: detail.includes("dimensions")
            ? "Sticker dimensions are too large"
            : "This image could not be decoded",
        });
      }
    }

    if (prepared.length === 0) {
      return NextResponse.json(
        { error: "None of the selected stickers could be processed", failures },
        { status: 422 },
      );
    }

    await writePreparedStickers(prepared);
    const records = stickerRecords(prepared);

    try {
      const stickers = await insertStickers(records);
      return NextResponse.json(
        { stickers, failures },
        { status: failures.length > 0 ? 207 : 201 },
      );
    } catch (error) {
      await Promise.all(
        records.map((sticker) => deleteStickerFile(sticker.fileName)),
      );
      throw error;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
