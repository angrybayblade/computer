import fs from "fs";
import path from "path";

export const SEED_DATA_DIR = path.join(process.cwd(), "scripts", "data");

export type SeedMovie = {
  id: string;
  name: string;
  thumb: string;
  description: string;
  rating: number;
};

export type SeedComic = {
  id: string;
  name: string;
  thumb: string;
  rating: number;
};

export type SeedAnime = {
  id: string;
  name: string;
  thumb: string;
  description: string;
  rating: number;
};

export type SeedSong = {
  id: string;
  title: string;
  artist: string;
  playConfig: { id: string; timestamp?: number };
  spotifyUrl?: string;
};

export type SeedPlaylist = {
  id: string;
  mood: string;
  name: string;
  description?: string;
  cover: string;
  spotifyUrl?: string;
  youtubeMusicUrl?: string;
};

export type SeedLyric = {
  id: string;
  lyric: string;
  artist: string;
  song: string;
  accent?: string;
};

export type SeedBook = {
  id: string;
  title: string;
  author: string;
  thumb: string;
  description: string;
  rating: number;
};

function readSeedJson<T>(filename: string): T {
  const filePath = path.join(SEED_DATA_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as T;
}

export function loadSeedMovies() {
  return readSeedJson<SeedMovie[]>("movies.json");
}

export function loadSeedComics() {
  return readSeedJson<SeedComic[]>("comics.json");
}

export function loadSeedAnime() {
  return readSeedJson<SeedAnime[]>("anime.json");
}

export function loadSeedSongs() {
  return readSeedJson<SeedSong[]>("songs.json");
}

export function loadSeedPlaylists() {
  return readSeedJson<SeedPlaylist[]>("playlists.json");
}

export function loadSeedLyrics() {
  return readSeedJson<SeedLyric[]>("lyrics.json");
}

export function loadSeedBooks() {
  return readSeedJson<SeedBook[]>("books.json");
}

export function loadAllSeedData() {
  return {
    movies: loadSeedMovies(),
    comics: loadSeedComics(),
    anime: loadSeedAnime(),
    songs: loadSeedSongs(),
    playlists: loadSeedPlaylists(),
    lyrics: loadSeedLyrics(),
    books: loadSeedBooks(),
  };
}
