import { getDatabaseClient, initializeDatabase } from "@/lib/db/client";
import type { Photo, StoredPhoto } from "./types";

let photoInitialization: Promise<void> | undefined;

function ensurePhotosTable() {
  photoInitialization ??= (async () => {
    await initializeDatabase();
    await getDatabaseClient().query(`
      CREATE TABLE IF NOT EXISTS photos (
        id TEXT PRIMARY KEY,
        file_name TEXT NOT NULL UNIQUE,
        width INTEGER NOT NULL CHECK (width > 0),
        height INTEGER NOT NULL CHECK (height > 0),
        created_at TIMESTAMPTZ NOT NULL,
        sort_order BIGSERIAL NOT NULL
      )
    `);
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
    "SELECT id, file_name, width, height, created_at FROM photos WHERE id = $1",
    [id],
  );
  return result.rows[0] ? storedPhoto(result.rows[0]) : null;
}

export async function insertPhotos(photos: StoredPhoto[]): Promise<Photo[]> {
  await ensurePhotosTable();
  const client = await getDatabaseClient().connect();

  try {
    await client.query("BEGIN");
    for (const photo of photos) {
      await client.query(
        "INSERT INTO photos (id, file_name, width, height, created_at) VALUES ($1, $2, $3, $4, $5)",
        [photo.id, photo.fileName, photo.width, photo.height, photo.createdAt],
      );
    }
    await client.query("COMMIT");
    return photos.map((photo) => ({
      id: photo.id,
      src: photo.src,
      width: photo.width,
      height: photo.height,
      createdAt: photo.createdAt,
    }));
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
    "DELETE FROM photos WHERE id = $1 RETURNING id, file_name, width, height, created_at",
    [id],
  );
  return result.rows[0] ? storedPhoto(result.rows[0]) : null;
}
