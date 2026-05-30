import type { Anime } from "@/lib/anime/types";
import type { Book } from "@/lib/books/types";
import type { Comic } from "@/lib/comics/types";
import type { Movie } from "@/lib/movies/types";
import type { Lyric, Playlist, Song } from "@/lib/music/types";
import type { Vine } from "@/lib/vines/types";
import { readResourceRows, type StorageRow, writeResourceRows } from "./client";
import { seedDatabaseIfEmpty } from "./seed";
import { getResourceConfig, isResourceSlug, type ResourceSlug } from "@/lib/metadata/resources";

type Row = StorageRow;

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

function mapBook(row: Row): Book {
  return {
    id: String(row.id),
    title: String(row.title),
    author: String(row.author),
    thumb: String(row.thumb),
    description: String(row.description),
    rating: Number(row.rating),
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

function mapVine(row: Row): Vine {
  return {
    id: String(row.id),
    title: String(row.title),
    videoId: String(row.video_id),
    startTime: Number(row.start_time),
    endTime: Number(row.end_time),
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
    case "books":
      return mapBook(row);
    case "vines":
      return mapVine(row);
  }
}

function normalizeInput(slug: ResourceSlug, input: Record<string, unknown>): Row {
  const normalized: Row = { ...input };

  if (slug === "movies" || slug === "anime" || slug === "comics" || slug === "books") {
    if (normalized.rating != null) normalized.rating = Number(normalized.rating);
  }

  if (slug === "songs" && normalized.play_config_timestamp === "") {
    delete normalized.play_config_timestamp;
  }

  if (slug === "songs" && normalized.play_config_timestamp != null && normalized.play_config_timestamp !== "") {
    normalized.play_config_timestamp = Number(normalized.play_config_timestamp);
  }

  if (slug === "vines") {
    if (normalized.start_time != null) normalized.start_time = Number(normalized.start_time);
    if (normalized.end_time != null) normalized.end_time = Number(normalized.end_time);
  }

  for (const key of Object.keys(normalized)) {
    if (normalized[key] === "") delete normalized[key];
  }

  return normalized;
}

function readRows(slug: ResourceSlug) {
  return readResourceRows(slug);
}

export function listResource(slug: ResourceSlug) {
  ensureReady();
  if (!getResourceConfig(slug)) throw new Error("Unknown resource");

  const rows = readRows(slug);

  if (slug === "movies" || slug === "anime" || slug === "comics") {
    return rows.map((row) => mapResource(slug, row)).sort((a, b) => {
      const aRating = "rating" in a ? a.rating : 0;
      const bRating = "rating" in b ? b.rating : 0;
      const aName = "name" in a ? a.name : "title" in a ? a.title : "";
      const bName = "name" in b ? b.name : "title" in b ? b.title : "";
      return bRating - aRating || aName.localeCompare(bName);
    });
  }

  return rows.map((row) => mapResource(slug, row));
}

export function getResourceRow(slug: ResourceSlug, id: string) {
  ensureReady();
  if (!getResourceConfig(slug)) throw new Error("Unknown resource");

  const row = readRows(slug).find((item) => String(item.id) === id);
  return row ? mapResource(slug, row) : null;
}

export function createResource(slug: ResourceSlug, input: Record<string, unknown>) {
  ensureReady();
  const config = getResourceConfig(slug);
  if (!config) throw new Error("Unknown resource");

  const data = normalizeInput(slug, input);
  const rows = readRows(slug);

  if (rows.some((row) => String(row.id) === String(data.id))) {
    throw new Error("Resource already exists");
  }

  rows.push(data);
  writeResourceRows(slug, rows);

  return getResourceRow(slug, String(data.id));
}

export function updateResource(slug: ResourceSlug, id: string, input: Record<string, unknown>) {
  ensureReady();
  const config = getResourceConfig(slug);
  if (!config) throw new Error("Unknown resource");

  const data = normalizeInput(slug, input);
  const rows = readRows(slug);
  const index = rows.findIndex((row) => String(row.id) === id);

  if (index === -1) return null;

  rows[index] = { ...rows[index], ...data, id };
  writeResourceRows(slug, rows);

  return getResourceRow(slug, id);
}

export function deleteResource(slug: ResourceSlug, id: string) {
  ensureReady();
  if (!getResourceConfig(slug)) throw new Error("Unknown resource");

  const rows = readRows(slug);
  const nextRows = rows.filter((row) => String(row.id) !== id);

  if (nextRows.length === rows.length) return false;

  writeResourceRows(slug, nextRows);
  return true;
}

export function listResourceRowsForEditor(slug: ResourceSlug) {
  ensureReady();
  if (!getResourceConfig(slug)) throw new Error("Unknown resource");

  return readRows(slug);
}

export function assertResourceSlug(slug: string): ResourceSlug {
  if (!isResourceSlug(slug)) throw new Error("Unknown resource");
  return slug;
}
