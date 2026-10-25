import { NextResponse } from "next/server";
import { isEditAuthenticated } from "@/lib/auth/edit-session";
import { deleteSticker, getStoredSticker } from "@/lib/stickers/repository";
import { deleteStickerFile, readStickerFile } from "@/lib/stickers/storage";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const sticker = await getStoredSticker(id);
  if (!sticker) return new Response("Not found", { status: 404 });

  try {
    const data = await readStickerFile(sticker.fileName);
    const download = new URL(request.url).searchParams.get("download") === "1";
    return new Response(new Uint8Array(data), {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        ...(download
          ? {
              "Content-Disposition": `attachment; filename="viraj-sticker-${id}.webp"`,
            }
          : {}),
        "Content-Type": "image/webp",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return new Response("Not found", { status: 404 });
    }
    throw error;
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isEditAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const sticker = await deleteSticker(id);
  if (!sticker) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteStickerFile(sticker.fileName);
  return NextResponse.json({ ok: true });
}
