import { Pool, type PoolClient, type QueryResultRow } from "pg";
import type { ResourceSlug } from "@/lib/metadata/resources";

export type StorageRow = Record<string, unknown>;

let pool: Pool | undefined;

export function getDatabaseClient() {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is required (for local Docker use postgresql://me:me@127.0.0.1:5432/me)",
    );
  }
  pool = new Pool({ connectionString });
  return pool;
}

const schema = [
  `CREATE TABLE IF NOT EXISTS movies (id TEXT PRIMARY KEY, name TEXT NOT NULL, thumb TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', rating REAL NOT NULL DEFAULT 0, sort_order BIGSERIAL NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS comics (id TEXT PRIMARY KEY, name TEXT NOT NULL, thumb TEXT NOT NULL, rating REAL NOT NULL DEFAULT 0, sort_order BIGSERIAL NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS anime (id TEXT PRIMARY KEY, name TEXT NOT NULL, thumb TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', rating REAL NOT NULL DEFAULT 0, sort_order BIGSERIAL NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS songs (id TEXT PRIMARY KEY, title TEXT NOT NULL, artist TEXT NOT NULL, play_config_id TEXT NOT NULL, play_config_timestamp INTEGER, spotify_url TEXT, sort_order BIGSERIAL NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS playlists (id TEXT PRIMARY KEY, mood TEXT NOT NULL, name TEXT NOT NULL, description TEXT, cover TEXT NOT NULL, spotify_url TEXT, youtube_music_url TEXT, sort_order BIGSERIAL NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS lyrics (id TEXT PRIMARY KEY, lyric TEXT NOT NULL, artist TEXT NOT NULL, song TEXT NOT NULL, accent TEXT, sort_order BIGSERIAL NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS books (id TEXT PRIMARY KEY, title TEXT NOT NULL, author TEXT NOT NULL, thumb TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', rating REAL NOT NULL DEFAULT 0, sort_order BIGSERIAL NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS vines (id TEXT PRIMARY KEY, title TEXT NOT NULL, video_id TEXT NOT NULL, start_time REAL NOT NULL, end_time REAL NOT NULL, sort_order BIGSERIAL NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS admin_auth (id INTEGER PRIMARY KEY CHECK (id = 1), totp_secret TEXT NOT NULL, last_used_counter INTEGER NOT NULL DEFAULT -1, failed_attempts INTEGER NOT NULL DEFAULT 0, locked_until INTEGER NOT NULL DEFAULT 0)`,
];

let initialization: Promise<void> | undefined;

export function initializeDatabase() {
  initialization ??= (async () => {
    const client = await getDatabaseClient().connect();
    try {
      await client.query("BEGIN");
      for (const sql of schema) await client.query(sql);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      initialization = undefined;
      throw error;
    } finally {
      client.release();
    }
  })();
  return initialization;
}

function entries(row: StorageRow) {
  return Object.entries(row).filter((entry) => entry[1] !== undefined);
}

function insertStatement(slug: ResourceSlug, row: StorageRow) {
  const values = entries(row);
  if (values.length === 0) throw new Error("Cannot insert an empty resource");
  return {
    text: `INSERT INTO ${slug} (${values.map(([key]) => key).join(", ")}) VALUES (${values.map((_, index) => `$${index + 1}`).join(", ")})`,
    values: values.map(([, value]) => value),
  };
}

function storageRows(rows: QueryResultRow[]): StorageRow[] {
  return rows.map((source) => {
    const row = { ...source };
    delete row.sort_order;
    return row;
  });
}

export async function readResourceRows(slug: ResourceSlug): Promise<StorageRow[]> {
  await initializeDatabase();
  const result = await getDatabaseClient().query(`SELECT * FROM ${slug} ORDER BY sort_order`);
  return storageRows(result.rows);
}

export async function readResourceRow(slug: ResourceSlug, id: string): Promise<StorageRow | null> {
  await initializeDatabase();
  const result = await getDatabaseClient().query(`SELECT * FROM ${slug} WHERE id = $1`, [id]);
  return storageRows(result.rows)[0] ?? null;
}

export async function insertResourceRow(slug: ResourceSlug, row: StorageRow) {
  await initializeDatabase();
  await getDatabaseClient().query(insertStatement(slug, row));
}

export async function updateResourceRow(slug: ResourceSlug, id: string, row: StorageRow) {
  await initializeDatabase();
  const values = entries(row).filter(([key]) => key !== "id");
  const result = await getDatabaseClient().query(
    `UPDATE ${slug} SET ${values.map(([key], index) => `${key} = $${index + 1}`).join(", ")} WHERE id = $${values.length + 1}`,
    [...values.map(([, value]) => value), id],
  );
  return (result.rowCount ?? 0) > 0;
}

export async function deleteResourceRow(slug: ResourceSlug, id: string) {
  await initializeDatabase();
  const result = await getDatabaseClient().query(`DELETE FROM ${slug} WHERE id = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
}

export async function resourceRowCount(slug: ResourceSlug) {
  await initializeDatabase();
  const result = await getDatabaseClient().query(`SELECT COUNT(*) AS count FROM ${slug}`);
  return Number(result.rows[0]?.count ?? 0);
}

export async function replaceResourceRows(slug: ResourceSlug, rows: StorageRow[]) {
  await initializeDatabase();
  const client = await getDatabaseClient().connect();
  await replaceRowsInTransaction(client, slug, rows);
}

async function replaceRowsInTransaction(client: PoolClient, slug: ResourceSlug, rows: StorageRow[]) {
  try {
    await client.query("BEGIN");
    await client.query(`DELETE FROM ${slug}`);
    for (const row of rows) await client.query(insertStatement(slug, row));
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
