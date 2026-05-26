import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createEditToken,
  editCookieOptions,
  EDIT_COOKIE_NAME,
  isEditAuthenticated,
  verifyEditPassword,
} from "@/lib/auth/edit-session";

export const runtime = "nodejs";

export async function GET() {
  const authenticated = await isEditAuthenticated();
  return NextResponse.json({ authenticated });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { password?: string };
  const password = body.password ?? "";

  if (!verifyEditPassword(password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(EDIT_COOKIE_NAME, createEditToken(), editCookieOptions());

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(EDIT_COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
