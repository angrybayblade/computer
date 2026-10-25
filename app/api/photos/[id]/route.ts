import { NextResponse } from "next/server";
import { isEditAuthenticated } from "@/lib/auth/edit-session";
import { deletePhoto, getStoredPhoto } from "@/lib/photos/repository";
import { deletePhotoFile, readPhotoFile } from "@/lib/photos/storage";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const photo = await getStoredPhoto(id);
  if (!photo) return new Response("Not found", { status: 404 });

  try {
    const data = await readPhotoFile(photo.fileName);
    const download = new URL(request.url).searchParams.get("download") === "1";
    return new Response(new Uint8Array(data), {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        ...(download
          ? {
              "Content-Disposition": `attachment; filename="viraj-photo-${id}.webp"`,
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
  const photo = await deletePhoto(id);
  if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deletePhotoFile(photo.fileName);
  return NextResponse.json({ ok: true });
}
