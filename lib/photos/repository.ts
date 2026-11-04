import { getDatabaseClient, initializeDatabase } from "@/lib/db/client";
import { md5Hex } from "@/lib/media/checksum";
import { readPhotoFile } from "./storage";
import type { Photo, StoredPhoto } from "./types";

let photoInitialization: Promise<void> | undefined;

function ensurePhotosTable() {
  photoInitialization ??= (async () => {
    await initializeDatabase();
    await getDatabaseClient().query(`
      CREATE TABLE IF NOT EXISTS photos (
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
      "ALTER TABLE photos ADD COLUMN IF NOT EXISTS content_md5 TEXT",
    );
    await getDatabaseClient().query(
      "CREATE UNIQUE INDEX IF NOT EXISTS photos_content_md5_unique ON photos (content_md5) WHERE content_md5 IS NOT NULL",
    );

    const missingChecksums = await getDatabaseClient().query(
      "SELECT id, file_name FROM photos WHERE content_md5 IS NULL ORDER BY sort_order",
    );
    for (const row of missingChecksums.rows) {
      try {
        const contentMd5 = md5Hex(await readPhotoFile(String(row.file_name)));
        await getDatabaseClient().query(
          `UPDATE photos SET content_md5 = $1
            WHERE id = $2 AND content_md5 IS NULL
              AND NOT EXISTS (SELECT 1 FROM photos WHERE content_md5 = $1)`,
          [contentMd5, String(row.id)],
        );
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
    }
  })().catch((error) => {
    photoInitialization = undefined;
    throw error;
  });

  return photoInitialization;
}

function publicPhoto(row: Record<string, unknown>): Photo {
  const id = String(row.id);
  return {
    id,
    src: `/api/photos/${id}`,
    width: Number(row.width),
    height: Number(row.height),
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

function storedPhoto(row: Record<string, unknown>): StoredPhoto {
  return {
    ...publicPhoto(row),
    fileName: String(row.file_name),
    contentMd5: row.content_md5 ? String(row.content_md5) : null,
  };
}

export async function listPhotos(): Promise<Photo[]> {
  await ensurePhotosTable();
  const result = await getDatabaseClient().query(
    "SELECT id, width, height, created_at FROM photos ORDER BY created_at DESC, sort_order DESC",
  );
  return result.rows.map(publicPhoto);
}

export async function getStoredPhoto(id: string): Promise<StoredPhoto | null> {
  await ensurePhotosTable();
  const result = await getDatabaseClient().query(
    "SELECT id, file_name, content_md5, width, height, created_at FROM photos WHERE id = $1",
    [id],
  );
  return result.rows[0] ? storedPhoto(result.rows[0]) : null;
}

export async function findPhotosByContentMd5(checksums: string[]) {
  await ensurePhotosTable();
  if (checksums.length === 0) return new Map<string, Photo>();

  const result = await getDatabaseClient().query(
    `SELECT id, content_md5, width, height, created_at
      FROM photos WHERE content_md5 = ANY($1::text[])`,
    [checksums],
  );
  return new Map(
    result.rows.map((row) => [String(row.content_md5), publicPhoto(row)]),
  );
}

export type InsertPhotosResult = {
  photos: Photo[];
  duplicates: Photo[];
  insertedIds: string[];
};

export async function insertPhotos(photos: StoredPhoto[]): Promise<InsertPhotosResult> {
  await ensurePhotosTable();
  const client = await getDatabaseClient().connect();
  const inserted: Photo[] = [];
  const duplicates: Photo[] = [];

  try {
    await client.query("BEGIN");
    for (const photo of photos) {
      const result = await client.query(
        `INSERT INTO photos (id, file_name, content_md5, width, height, created_at)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (content_md5) WHERE content_md5 IS NOT NULL DO NOTHING
          RETURNING id, width, height, created_at`,
        [
          photo.id,
          photo.fileName,
          photo.contentMd5,
          photo.width,
          photo.height,
          photo.createdAt,
        ],
      );
      if (result.rows[0]) {
        inserted.push(publicPhoto(result.rows[0]));
        continue;
      }

      const existing = await client.query(
        "SELECT id, width, height, created_at FROM photos WHERE content_md5 = $1",
        [photo.contentMd5],
      );
      if (existing.rows[0]) duplicates.push(publicPhoto(existing.rows[0]));
    }
    await client.query("COMMIT");
    return {
      photos: inserted,
      duplicates,
      insertedIds: inserted.map((photo) => photo.id),
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deletePhoto(id: string): Promise<StoredPhoto | null> {
  await ensurePhotosTable();
  const result = await getDatabaseClient().query(
    "DELETE FROM photos WHERE id = $1 RETURNING id, file_name, content_md5, width, height, created_at",
    [id],
  );
  return result.rows[0] ? storedPhoto(result.rows[0]) : null;
}
