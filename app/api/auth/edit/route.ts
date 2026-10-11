import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createEditToken,
  editCookieOptions,
  EDIT_COOKIE_NAME,
  isEditAuthenticated,
} from "@/lib/auth/edit-session";
import { isTotpConfigured, verifyTotp } from "@/lib/auth/totp";

export const runtime = "nodejs";

export async function GET() {
  const authenticated = await isEditAuthenticated();
  return NextResponse.json({ authenticated, configured: await isTotpConfigured() });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { code?: string };
  const result = await verifyTotp((body.code ?? "").replace(/\s/g, ""));

  if (result === "not-configured") {
    return NextResponse.json({ error: "Authenticator login is not configured" }, { status: 503 });
  }
  if (result === "locked") {
    return NextResponse.json({ error: "Too many attempts. Try again in five minutes." }, { status: 429 });
  }
  if (result !== "valid") {
    return NextResponse.json({ error: "Invalid or already used code" }, { status: 401 });
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
