import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const EDIT_COOKIE_NAME = "edit-session";

function sessionSecret() {
  return process.env.EDIT_SESSION_SECRET || process.env.EDIT_PASSWORD || "dev-edit-secret";
}

export function createEditToken() {
  return createHmac("sha256", sessionSecret()).update("edit-access").digest("hex");
}

export function verifyEditToken(token: string) {
  try {
    const expected = createEditToken();
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function verifyEditPassword(password: string) {
  const expected = process.env.EDIT_PASSWORD;
  if (!expected) return password === "bauhaus";
  return password === expected;
}

export async function isEditAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(EDIT_COOKIE_NAME)?.value;
  return token ? verifyEditToken(token) : false;
}

export function editCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24,
    secure: process.env.NODE_ENV === "production",
  };
}
