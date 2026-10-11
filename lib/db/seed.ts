import type { ResourceSlug } from "@/lib/metadata/resources";
import { type StorageRow, replaceResourceRows, resourceRowCount } from "./client";
import {
  loadAllSeedData,
  type SeedAnime,
  type SeedBook,
  type SeedComic,
  type SeedLyric,
  type SeedMovie,
  type SeedPlaylist,
  type SeedSong,
  type SeedVine,
} from "./seed-data";

type SeedOptions = {
  force?: boolean;
};

async function shouldSeed(slug: ResourceSlug, force?: boolean) {
  return force || (await resourceRowCount(slug)) === 0;
}

async function seedRows(slug: ResourceSlug, rows: StorageRow[], force?: boolean) {
  if (!(await shouldSeed(slug, force))) return 0;
  await replaceResourceRows(slug, rows);
  return rows.length;
}

function seedMovieRows(items: SeedMovie[]): StorageRow[] {
  return items.map((row) => ({ ...row }));
}

function seedComicRows(items: SeedComic[]): StorageRow[] {
  return items.map((row) => ({ ...row }));
}

function seedAnimeRows(items: SeedAnime[]): StorageRow[] {
  return items.map((row) => ({ ...row }));
}

function seedSongRows(items: SeedSong[]): StorageRow[] {
  return items.map((row) => ({
    id: row.id,
    title: row.title,
    artist: row.artist,
    play_config_id: row.playConfig.id,
    ...(row.playConfig.timestamp != null ? { play_config_timestamp: row.playConfig.timestamp } : {}),
    ...(row.spotifyUrl ? { spotify_url: row.spotifyUrl } : {}),
  }));
}

function seedPlaylistRows(items: SeedPlaylist[]): StorageRow[] {
  return items.map((row) => ({
    id: row.id,
    mood: row.mood,
    name: row.name,
    cover: row.cover,
    ...(row.description ? { description: row.description } : {}),
    ...(row.spotifyUrl ? { spotify_url: row.spotifyUrl } : {}),
    ...(row.youtubeMusicUrl ? { youtube_music_url: row.youtubeMusicUrl } : {}),
  }));
}

function seedLyricRows(items: SeedLyric[]): StorageRow[] {
  return items.map((row) => ({ ...row }));
}

function seedBookRows(items: SeedBook[]): StorageRow[] {
  return items.map((row) => ({ ...row }));
}

function seedVineRows(items: SeedVine[]): StorageRow[] {
  return items.map((row) => ({
    id: row.id,
    title: row.title,
    video_id: row.videoId,
    start_time: row.startTime,
    end_time: row.endTime,
  }));
}

export async function seedDatabase(options: SeedOptions = {}) {
  const { force = false } = options;
  const data = loadAllSeedData();

  return {
    movies: await seedRows("movies", seedMovieRows(data.movies), force),
    comics: await seedRows("comics", seedComicRows(data.comics), force),
    anime: await seedRows("anime", seedAnimeRows(data.anime), force),
    songs: await seedRows("songs", seedSongRows(data.songs), force),
    playlists: await seedRows("playlists", seedPlaylistRows(data.playlists), force),
    lyrics: await seedRows("lyrics", seedLyricRows(data.lyrics), force),
    books: await seedRows("books", seedBookRows(data.books), force),
    vines: await seedRows("vines", seedVineRows(data.vines), force),
  };
}

let initialSeed: Promise<Awaited<ReturnType<typeof seedDatabase>>> | undefined;

export async function seedDatabaseIfEmpty() {
  initialSeed ??= seedDatabase({ force: false }).catch((error) => {
    initialSeed = undefined;
    throw error;
  });
  return initialSeed;
}
