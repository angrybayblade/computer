import { createClient, type Client, type InValue } from "@libsql/client";
import type { ResourceSlug } from "@/lib/metadata/resources";

export type StorageRow = Record<string, unknown>;

let client: Client | undefined;

export function getDatabaseClient() {
  if (client) return client;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required (for local Docker use http://db:8080)");
  client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });
  return client;
}

const schema = [
  `CREATE TABLE IF NOT EXISTS movies (id TEXT PRIMARY KEY, name TEXT NOT NULL, thumb TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', rating REAL NOT NULL DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS comics (id TEXT PRIMARY KEY, name TEXT NOT NULL, thumb TEXT NOT NULL, rating REAL NOT NULL DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS anime (id TEXT PRIMARY KEY, name TEXT NOT NULL, thumb TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', rating REAL NOT NULL DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS songs (id TEXT PRIMARY KEY, title TEXT NOT NULL, artist TEXT NOT NULL, play_config_id TEXT NOT NULL, play_config_timestamp INTEGER, spotify_url TEXT)`,
  `CREATE TABLE IF NOT EXISTS playlists (id TEXT PRIMARY KEY, mood TEXT NOT NULL, name TEXT NOT NULL, description TEXT, cover TEXT NOT NULL, spotify_url TEXT, youtube_music_url TEXT)`,
  `CREATE TABLE IF NOT EXISTS lyrics (id TEXT PRIMARY KEY, lyric TEXT NOT NULL, artist TEXT NOT NULL, song TEXT NOT NULL, accent TEXT)`,
  `CREATE TABLE IF NOT EXISTS books (id TEXT PRIMARY KEY, title TEXT NOT NULL, author TEXT NOT NULL, thumb TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', rating REAL NOT NULL DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS vines (id TEXT PRIMARY KEY, title TEXT NOT NULL, video_id TEXT NOT NULL, start_time REAL NOT NULL, end_time REAL NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS admin_auth (id INTEGER PRIMARY KEY CHECK (id = 1), totp_secret TEXT NOT NULL, last_used_counter INTEGER NOT NULL DEFAULT -1, failed_attempts INTEGER NOT NULL DEFAULT 0, locked_until INTEGER NOT NULL DEFAULT 0)`,
];

let initialization: Promise<void> | undefined;

export function initializeDatabase() {
  initialization ??= getDatabaseClient()
    .batch(schema.map((sql) => ({ sql, args: [] })), "write")
    .then(() => undefined)
    .catch((error) => {
      initialization = undefined;
      throw error;
    });
  return initialization;
}

function entries(row: StorageRow) {
  return Object.entries(row).filter((entry): entry is [string, InValue] => entry[1] !== undefined);
}

function insertStatement(slug: ResourceSlug, row: StorageRow) {
  const values = entries(row);
  if (values.length === 0) throw new Error("Cannot insert an empty resource");
  return {
    sql: `INSERT INTO ${slug} (${values.map(([key]) => key).join(", ")}) VALUES (${values.map(() => "?").join(", ")})`,
    args: values.map(([, value]) => value),
  };
}

export async function readResourceRows(slug: ResourceSlug): Promise<StorageRow[]> {
  await initializeDatabase();
  const result = await getDatabaseClient().execute(`SELECT * FROM ${slug} ORDER BY rowid`);
  return result.rows.map((row) => ({ ...row }));
}

export async function readResourceRow(slug: ResourceSlug, id: string): Promise<StorageRow | null> {
  await initializeDatabase();
  const result = await getDatabaseClient().execute({ sql: `SELECT * FROM ${slug} WHERE id = ?`, args: [id] });
  return result.rows[0] ? { ...result.rows[0] } : null;
}

export async function insertResourceRow(slug: ResourceSlug, row: StorageRow) {
  await initializeDatabase();
  await getDatabaseClient().execute(insertStatement(slug, row));
}

export async function updateResourceRow(slug: ResourceSlug, id: string, row: StorageRow) {
  await initializeDatabase();
  const values = entries(row).filter(([key]) => key !== "id");
  const result = await getDatabaseClient().execute({
    sql: `UPDATE ${slug} SET ${values.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`,
    args: [...values.map(([, value]) => value), id],
  });
  return result.rowsAffected > 0;
}

export async function deleteResourceRow(slug: ResourceSlug, id: string) {
  await initializeDatabase();
  const result = await getDatabaseClient().execute({ sql: `DELETE FROM ${slug} WHERE id = ?`, args: [id] });
  return result.rowsAffected > 0;
}

export async function resourceRowCount(slug: ResourceSlug) {
  await initializeDatabase();
  const result = await getDatabaseClient().execute(`SELECT COUNT(*) AS count FROM ${slug}`);
  return Number(result.rows[0]?.count ?? 0);
}

export async function replaceResourceRows(slug: ResourceSlug, rows: StorageRow[]) {
  await initializeDatabase();
  await getDatabaseClient().batch(
    [{ sql: `DELETE FROM ${slug}`, args: [] }, ...rows.map((row) => insertStatement(slug, row))],
    "write",
  );
}
