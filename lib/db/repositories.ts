import type { Anime } from "@/lib/anime/types";
import type { Comic } from "@/lib/comics/types";
import type { Movie } from "@/lib/movies/types";
import type { Lyric, Playlist, Song } from "@/lib/music/types";
import { getDb } from "./client";
import { seedDatabaseIfEmpty } from "./seed";
import { getResourceConfig, isResourceSlug, type ResourceSlug } from "@/lib/metadata/resources";

type Row = Record<string, unknown>;

function ensureReady() {
  seedDatabaseIfEmpty();
}

function mapMovie(row: Row): Movie {
  return {
    id: String(row.id),
    name: String(row.name),
    thumb: String(row.thumb),
    description: String(row.description),
    rating: Number(row.rating),
  };
}

function mapComic(row: Row): Comic {
  return {
    id: String(row.id),
    name: String(row.name),
    thumb: String(row.thumb),
    rating: Number(row.rating),
  };
}

function mapAnime(row: Row): Anime {
  return {
    id: String(row.id),
    name: String(row.name),
    thumb: String(row.thumb),
    description: String(row.description),
    rating: Number(row.rating),
  };
}

function mapSong(row: Row): Song {
  return {
    id: String(row.id),
    title: String(row.title),
    artist: String(row.artist),
    playConfig: {
      id: String(row.play_config_id),
      ...(row.play_config_timestamp != null
        ? { timestamp: Number(row.play_config_timestamp) }
        : {}),
    },
    ...(row.spotify_url ? { spotifyUrl: String(row.spotify_url) } : {}),
  };
}

function mapPlaylist(row: Row): Playlist {
  return {
    id: String(row.id),
    mood: String(row.mood),
    name: String(row.name),
    cover: String(row.cover),
    ...(row.description ? { description: String(row.description) } : {}),
    ...(row.spotify_url ? { spotifyUrl: String(row.spotify_url) } : {}),
    ...(row.youtube_music_url ? { youtubeMusicUrl: String(row.youtube_music_url) } : {}),
  };
}

function mapLyric(row: Row): Lyric {
  return {
    id: String(row.id),
    lyric: String(row.lyric),
    artist: String(row.artist),
    song: String(row.song),
    ...(row.accent ? { accent: String(row.accent) } : {}),
  };
}

function mapResource(slug: ResourceSlug, row: Row) {
  switch (slug) {
    case "movies":
      return mapMovie(row);
    case "comics":
      return mapComic(row);
    case "anime":
      return mapAnime(row);
    case "songs":
      return mapSong(row);
    case "playlists":
      return mapPlaylist(row);
    case "lyrics":
      return mapLyric(row);
  }
}

function normalizeInput(slug: ResourceSlug, input: Record<string, unknown>): Row {
  const normalized: Row = { ...input };

  if (slug === "movies" || slug === "anime" || slug === "comics") {
    if (normalized.rating != null) normalized.rating = Number(normalized.rating);
  }

  if (slug === "songs" && normalized.play_config_timestamp === "") {
    normalized.play_config_timestamp = null;
  }

  if (slug === "songs" && normalized.play_config_timestamp != null && normalized.play_config_timestamp !== "") {
    normalized.play_config_timestamp = Number(normalized.play_config_timestamp);
  }

  for (const key of Object.keys(normalized)) {
    if (normalized[key] === "") normalized[key] = null;
  }

  return normalized;
}

export function listResource(slug: ResourceSlug) {
  ensureReady();
  const config = getResourceConfig(slug);
  if (!config) throw new Error("Unknown resource");

  const db = getDb();
  const rows = db.prepare(`SELECT * FROM ${config.table} ORDER BY rowid ASC`).all() as Row[];

  if (slug === "movies" || slug === "anime") {
    return rows.map((row) => mapResource(slug, row)).sort((a, b) => {
      const aRating = "rating" in a ? a.rating : 0;
      const bRating = "rating" in b ? b.rating : 0;
      const aName = "name" in a ? a.name : "";
      const bName = "name" in b ? b.name : "";
      return bRating - aRating || aName.localeCompare(bName);
    });
  }

  return rows.map((row) => mapResource(slug, row));
}

export function getResourceRow(slug: ResourceSlug, id: string) {
  ensureReady();
  const config = getResourceConfig(slug);
  if (!config) throw new Error("Unknown resource");

  const db = getDb();
  const row = db.prepare(`SELECT * FROM ${config.table} WHERE id = ?`).get(id) as Row | undefined;
  return row ? mapResource(slug, row) : null;
}

export function createResource(slug: ResourceSlug, input: Record<string, unknown>) {
  ensureReady();
  const config = getResourceConfig(slug);
  if (!config) throw new Error("Unknown resource");

  const data = normalizeInput(slug, input);
  const columns = config.fields.map((field) => field.key);
  const placeholders = columns.map((col) => `@${col}`).join(", ");
  const db = getDb();

  db.prepare(
    `INSERT INTO ${config.table} (${columns.join(", ")}) VALUES (${placeholders})`
  ).run(data);

  return getResourceRow(slug, String(data.id));
}

export function updateResource(slug: ResourceSlug, id: string, input: Record<string, unknown>) {
  ensureReady();
  const config = getResourceConfig(slug);
  if (!config) throw new Error("Unknown resource");

  const data = normalizeInput(slug, input);
  const columns = config.fields
    .map((field) => field.key)
    .filter((key) => key !== "id");

  const assignments = columns.map((col) => `${col} = @${col}`).join(", ");
  const db = getDb();

  db.prepare(`UPDATE ${config.table} SET ${assignments} WHERE id = @id`).run({
    ...data,
    id,
  });

  return getResourceRow(slug, id);
}

export function deleteResource(slug: ResourceSlug, id: string) {
  ensureReady();
  const config = getResourceConfig(slug);
  if (!config) throw new Error("Unknown resource");

  const db = getDb();
  const result = db.prepare(`DELETE FROM ${config.table} WHERE id = ?`).run(id);
  return result.changes > 0;
}

export function listResourceRowsForEditor(slug: ResourceSlug) {
  ensureReady();
  const config = getResourceConfig(slug);
  if (!config) throw new Error("Unknown resource");

  const db = getDb();
  return db.prepare(`SELECT * FROM ${config.table} ORDER BY rowid ASC`).all() as Row[];
}

export function assertResourceSlug(slug: string): ResourceSlug {
  if (!isResourceSlug(slug)) throw new Error("Unknown resource");
  return slug;
}
