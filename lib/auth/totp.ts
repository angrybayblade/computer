import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import * as OTPAuth from "otpauth";
import { getDatabaseClient, initializeDatabase } from "@/lib/db/client";

const PERIOD_SECONDS = 30;
const MAX_FAILURES = 5;
const LOCK_SECONDS = 5 * 60;

type AdminAuthRow = {
  totp_secret: string;
  last_used_counter: number;
  failed_attempts: number;
  locked_until: number;
};

function encryptionKey() {
  const secret = process.env.EDIT_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("EDIT_SESSION_SECRET must be set to at least 32 characters");
  }
  return createHash("sha256").update(secret).digest();
}

function encryptSecret(secret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  return `v1.${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${encrypted.toString("base64url")}`;
}

function decryptSecret(value: string) {
  const [version, iv, tag, encrypted] = value.split(".");
  if (version !== "v1" || !iv || !tag || !encrypted) throw new Error("Invalid stored TOTP secret");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(encrypted, "base64url")), decipher.final()]).toString("utf8");
}

async function authRow(): Promise<AdminAuthRow | null> {
  await initializeDatabase();
  const result = await getDatabaseClient().query(
    "SELECT totp_secret, last_used_counter, failed_attempts, locked_until FROM admin_auth WHERE id = 1",
  );
  if (!result.rows[0]) return null;
  return {
    totp_secret: String(result.rows[0].totp_secret),
    last_used_counter: Number(result.rows[0].last_used_counter),
    failed_attempts: Number(result.rows[0].failed_attempts),
    locked_until: Number(result.rows[0].locked_until),
  };
}

export async function isTotpConfigured() {
  return (await authRow()) !== null;
}

export async function configureTotp(secret: string, force = false) {
  await initializeDatabase();
  if (!force && (await authRow())) throw new Error("TOTP is already configured; pass --force to rotate it");
  await getDatabaseClient().query(
    `INSERT INTO admin_auth (id, totp_secret) VALUES (1, $1)
      ON CONFLICT(id) DO UPDATE SET totp_secret = excluded.totp_secret, last_used_counter = -1,
      failed_attempts = 0, locked_until = 0`,
    [encryptSecret(secret)],
  );
}

async function recordFailure(currentFailures: number, now: number) {
  const failures = currentFailures + 1;
  const lockedUntil = failures >= MAX_FAILURES ? now + LOCK_SECONDS : 0;
  await getDatabaseClient().query(
    "UPDATE admin_auth SET failed_attempts = $1, locked_until = $2 WHERE id = 1",
    [failures >= MAX_FAILURES ? 0 : failures, lockedUntil],
  );
}

export type TotpVerification = "valid" | "invalid" | "locked" | "not-configured";

export async function verifyTotp(code: string): Promise<TotpVerification> {
  const row = await authRow();
  if (!row) return "not-configured";

  const now = Math.floor(Date.now() / 1000);
  if (row.locked_until > now) return "locked";
  if (!/^\d{6}$/.test(code)) {
    await recordFailure(row.failed_attempts, now);
    return "invalid";
  }

  const totp = new OTPAuth.TOTP({
    secret: OTPAuth.Secret.fromBase32(decryptSecret(row.totp_secret)),
    algorithm: "SHA1",
    digits: 6,
    period: PERIOD_SECONDS,
  });
  const delta = totp.validate({ token: code, timestamp: now * 1000, window: 1 });
  if (delta === null) {
    await recordFailure(row.failed_attempts, now);
    return "invalid";
  }

  const counter = Math.floor(now / PERIOD_SECONDS) + delta;
  const result = await getDatabaseClient().query(
    `UPDATE admin_auth SET last_used_counter = $1, failed_attempts = 0, locked_until = 0
      WHERE id = 1 AND last_used_counter < $2`,
    [counter, counter],
  );
  return result.rowCount === 1 ? "valid" : "invalid";
}
