import * as OTPAuth from "otpauth";
import qrcode from "qrcode-terminal";
import QRCode from "qrcode";
import { chmod } from "node:fs/promises";
import { configureTotp } from "../lib/auth/totp";

async function main() {
  const force = process.argv.includes("--force");
  const issuer = process.env.ADMIN_TOTP_ISSUER ?? "Me Admin";
  const label = process.env.ADMIN_TOTP_LABEL ?? "admin";
  const totp = new OTPAuth.TOTP({
    issuer,
    label,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: new OTPAuth.Secret({ size: 20 }),
  });

  await configureTotp(totp.secret.base32, force);

  console.log(`\nScan this QR code with your authenticator app (${issuer}: ${label}):\n`);
  qrcode.generate(totp.toString(), { small: true });
  const qrPath = process.env.ADMIN_TOTP_QR_PATH;
  if (qrPath) {
    await QRCode.toFile(qrPath, totp.toString(), { margin: 2, width: 512 });
    await chmod(qrPath, 0o600);
    console.log(`PNG QR code: ${qrPath}`);
  }
  console.log(`\nManual setup key: ${totp.secret.base32}`);
  console.log("Store that key securely; it is required to recover or transfer the authenticator entry.\n");
}

void main();
