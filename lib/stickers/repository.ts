import { getDatabaseClient, initializeDatabase } from "@/lib/db/client";
import { md5Hex } from "@/lib/media/checksum";
import { readStickerFile } from "./storage";
import type { Sticker, StoredSticker } from "./types";

let stickerInitialization: Promise<void> | undefined;

function ensureStickersTable() {
  stickerInitialization ??= (async () => {
    await initializeDatabase();
    await getDatabaseClient().query(`
      CREATE TABLE IF NOT EXISTS stickers (
        id TEXT PRIMARY KEY,
        file_name TEXT NOT NULL UNIQUE,
        content_md5 TEXT,
        width INTEGER NOT NULL CHECK (width > 0),
        height INTEGER NOT NULL CHECK (height > 0),
        created_at TIMESTAMPTZ NOT NULL,
        sort_order BIGSERIAL NOT NULL
      )
    `);
    await getDatabaseClient().query(
      "ALTER TABLE stickers ADD COLUMN IF NOT EXISTS content_md5 TEXT",
    );
    await getDatabaseClient().query(
      "CREATE UNIQUE INDEX IF NOT EXISTS stickers_content_md5_unique ON stickers (content_md5) WHERE content_md5 IS NOT NULL",
    );

    const missingChecksums = await getDatabaseClient().query(
      "SELECT id, file_name FROM stickers WHERE content_md5 IS NULL ORDER BY sort_order",
    );
    for (const row of missingChecksums.rows) {
      try {
        const contentMd5 = md5Hex(await readStickerFile(String(row.file_name)));
        await getDatabaseClient().query(
          `UPDATE stickers SET content_md5 = $1
            WHERE id = $2 AND content_md5 IS NULL
              AND NOT EXISTS (SELECT 1 FROM stickers WHERE content_md5 = $1)`,
          [contentMd5, String(row.id)],
        );
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
    }
  })().catch((error) => {
    stickerInitialization = undefined;
    throw error;
  });

  return stickerInitialization;
}

function publicSticker(row: Record<string, unknown>): Sticker {
  const id = String(row.id);
  return {
    id,
    src: `/api/stickers/${id}`,
    width: Number(row.width),
    height: Number(row.height),
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

function storedSticker(row: Record<string, unknown>): StoredSticker {
  return {
    ...publicSticker(row),
    fileName: String(row.file_name),
    contentMd5: row.content_md5 ? String(row.content_md5) : null,
  };
}

export async function listStickers(): Promise<Sticker[]> {
  await ensureStickersTable();
  const result = await getDatabaseClient().query(
    "SELECT id, width, height, created_at FROM stickers ORDER BY created_at DESC, sort_order DESC",
  );
  return result.rows.map(publicSticker);
}

export async function getStoredSticker(id: string): Promise<StoredSticker | null> {
  await ensureStickersTable();
  const result = await getDatabaseClient().query(
    "SELECT id, file_name, content_md5, width, height, created_at FROM stickers WHERE id = $1",
    [id],
  );
  return result.rows[0] ? storedSticker(result.rows[0]) : null;
}

export async function findStickersByContentMd5(checksums: string[]) {
  await ensureStickersTable();
  if (checksums.length === 0) return new Map<string, Sticker>();

  const result = await getDatabaseClient().query(
    `SELECT id, content_md5, width, height, created_at
      FROM stickers WHERE content_md5 = ANY($1::text[])`,
    [checksums],
  );
  return new Map(
    result.rows.map((row) => [String(row.content_md5), publicSticker(row)]),
  );
}

export type InsertStickersResult = {
  stickers: Sticker[];
  duplicates: Sticker[];
  insertedIds: string[];
};

export async function insertStickers(stickers: StoredSticker[]): Promise<InsertStickersResult> {
  await ensureStickersTable();
  const client = await getDatabaseClient().connect();
  const inserted: Sticker[] = [];
  const duplicates: Sticker[] = [];

  try {
    await client.query("BEGIN");
    for (const sticker of stickers) {
      const result = await client.query(
        `INSERT INTO stickers (id, file_name, content_md5, width, height, created_at)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (content_md5) WHERE content_md5 IS NOT NULL DO NOTHING
          RETURNING id, width, height, created_at`,
        [
          sticker.id,
          sticker.fileName,
          sticker.contentMd5,
          sticker.width,
          sticker.height,
          sticker.createdAt,
        ],
      );
      if (result.rows[0]) {
        inserted.push(publicSticker(result.rows[0]));
        continue;
      }

      const existing = await client.query(
        "SELECT id, width, height, created_at FROM stickers WHERE content_md5 = $1",
        [sticker.contentMd5],
      );
      if (existing.rows[0]) duplicates.push(publicSticker(existing.rows[0]));
    }
    await client.query("COMMIT");
    return {
      stickers: inserted,
      duplicates,
      insertedIds: inserted.map((sticker) => sticker.id),
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteSticker(id: string): Promise<StoredSticker | null> {
  await ensureStickersTable();
  const result = await getDatabaseClient().query(
    "DELETE FROM stickers WHERE id = $1 RETURNING id, file_name, content_md5, width, height, created_at",
    [id],
  );
  return result.rows[0] ? storedSticker(result.rows[0]) : null;
}
