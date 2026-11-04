import { createHash } from "node:crypto";

export function md5Hex(data: Uint8Array) {
  return createHash("md5").update(data).digest("hex");
}
