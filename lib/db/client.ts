import fs from "fs";
import path from "path";
import type { ResourceSlug } from "@/lib/metadata/resources";

export const DATA_DIR = path.join(process.cwd(), ".data");

export type StorageRow = Record<string, unknown>;

export function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function dataFilePath(slug: ResourceSlug) {
  return path.join(DATA_DIR, `${slug}.json`);
}

export function readResourceRows(slug: ResourceSlug): StorageRow[] {
  ensureDataDir();
  const filePath = dataFilePath(slug);

  if (!fs.existsSync(filePath)) {
    return [];
  }

  const parsed = JSON.parse(fs.readFileSync(filePath, "utf8")) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error(`Invalid data file: ${slug}.json`);
  }

  return parsed as StorageRow[];
}

export function writeResourceRows(slug: ResourceSlug, rows: StorageRow[]) {
  ensureDataDir();
  const filePath = dataFilePath(slug);
  const tmpPath = `${filePath}.tmp`;

  fs.writeFileSync(tmpPath, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
  fs.renameSync(tmpPath, filePath);
}

export function resourceRowCount(slug: ResourceSlug) {
  return readResourceRows(slug).length;
}
