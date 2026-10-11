import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const EDIT_COOKIE_NAME = "edit-session";
const SESSION_SECONDS = 60 * 60 * 8;

function sessionSecret() {
  const secret = process.env.EDIT_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("EDIT_SESSION_SECRET must be set to at least 32 characters");
  }
  return secret;
}

function signature(payload: string) {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

export function createEditToken() {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = `${expires}.${randomBytes(16).toString("base64url")}`;
  return `${payload}.${signature(payload)}`;
}

export function verifyEditToken(token: string) {
  try {
    const [expires, nonce, supplied] = token.split(".");
    if (!expires || !nonce || !supplied || Number(expires) <= Date.now() / 1000) return false;
    const expected = signature(`${expires}.${nonce}`);
    const suppliedBytes = Buffer.from(supplied);
    const expectedBytes = Buffer.from(expected);
    return suppliedBytes.length === expectedBytes.length && timingSafeEqual(suppliedBytes, expectedBytes);
  } catch {
    return false;
  }
}

export async function isEditAuthenticated() {
  const token = (await cookies()).get(EDIT_COOKIE_NAME)?.value;
  return token ? verifyEditToken(token) : false;
}

export function editCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    path: "/",
    maxAge: SESSION_SECONDS,
    secure: process.env.NODE_ENV === "production",
    priority: "high" as const,
  };
}
