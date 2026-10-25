import { getDatabaseClient, initializeDatabase } from "@/lib/db/client";
import type { Sticker, StoredSticker } from "./types";

let stickerInitialization: Promise<void> | undefined;

function ensureStickersTable() {
  stickerInitialization ??= (async () => {
    await initializeDatabase();
    await getDatabaseClient().query(`
      CREATE TABLE IF NOT EXISTS stickers (
        id TEXT PRIMARY KEY,
        file_name TEXT NOT NULL UNIQUE,
        width INTEGER NOT NULL CHECK (width > 0),
        height INTEGER NOT NULL CHECK (height > 0),
        created_at TIMESTAMPTZ NOT NULL,
        sort_order BIGSERIAL NOT NULL
      )
    `);
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
    "SELECT id, file_name, width, height, created_at FROM stickers WHERE id = $1",
    [id],
  );
  return result.rows[0] ? storedSticker(result.rows[0]) : null;
}

export async function insertStickers(stickers: StoredSticker[]): Promise<Sticker[]> {
  await ensureStickersTable();
  const client = await getDatabaseClient().connect();

  try {
    await client.query("BEGIN");
    for (const sticker of stickers) {
      await client.query(
        "INSERT INTO stickers (id, file_name, width, height, created_at) VALUES ($1, $2, $3, $4, $5)",
        [
          sticker.id,
          sticker.fileName,
          sticker.width,
          sticker.height,
          sticker.createdAt,
        ],
      );
    }
    await client.query("COMMIT");
    return stickers.map((sticker) => ({
      id: sticker.id,
      src: sticker.src,
      width: sticker.width,
      height: sticker.height,
      createdAt: sticker.createdAt,
    }));
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
    "DELETE FROM stickers WHERE id = $1 RETURNING id, file_name, width, height, created_at",
    [id],
  );
  return result.rows[0] ? storedSticker(result.rows[0]) : null;
}
