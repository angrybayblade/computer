import { getDb } from "./client";
import {
  loadAllSeedData,
  type SeedAnime,
  type SeedComic,
  type SeedLyric,
  type SeedMovie,
  type SeedPlaylist,
  type SeedSong,
} from "./seed-data";

type SeedOptions = {
  force?: boolean;
};

function tableCount(table: string) {
  const db = getDb();
  const row = db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get() as { count: number };
  return row.count;
}

function shouldSeed(table: string, force?: boolean) {
  return force || tableCount(table) === 0;
}

function seedMovies(force?: boolean) {
  if (!shouldSeed("movies", force)) return 0;

  const db = getDb();
  if (force) db.prepare("DELETE FROM movies").run();

  const rows = loadAllSeedData().movies;
  const insert = db.prepare(
    "INSERT INTO movies (id, name, thumb, description, rating) VALUES (@id, @name, @thumb, @description, @rating)"
  );
  const tx = db.transaction((items: SeedMovie[]) => {
    for (const row of items) insert.run(row);
  });
  tx(rows);
  return rows.length;
}

function seedComics(force?: boolean) {
  if (!shouldSeed("comics", force)) return 0;

  const db = getDb();
  if (force) db.prepare("DELETE FROM comics").run();

  const rows = loadAllSeedData().comics;
  const insert = db.prepare(
    "INSERT INTO comics (id, name, thumb, rating) VALUES (@id, @name, @thumb, @rating)"
  );
  const tx = db.transaction((items: SeedComic[]) => {
    for (const row of items) insert.run(row);
  });
  tx(rows);
  return rows.length;
}

function seedAnime(force?: boolean) {
  if (!shouldSeed("anime", force)) return 0;

  const db = getDb();
  if (force) db.prepare("DELETE FROM anime").run();

  const rows = loadAllSeedData().anime;
  const insert = db.prepare(
    "INSERT INTO anime (id, name, thumb, description, rating) VALUES (@id, @name, @thumb, @description, @rating)"
  );
  const tx = db.transaction((items: SeedAnime[]) => {
    for (const row of items) insert.run(row);
  });
  tx(rows);
  return rows.length;
}

function seedSongs(force?: boolean) {
  if (!shouldSeed("songs", force)) return 0;

  const db = getDb();
  if (force) db.prepare("DELETE FROM songs").run();

  const rows = loadAllSeedData().songs;
  const insert = db.prepare(
    "INSERT INTO songs (id, title, artist, play_config_id, play_config_timestamp, spotify_url) VALUES (@id, @title, @artist, @play_config_id, @play_config_timestamp, @spotify_url)"
  );
  const tx = db.transaction((items: SeedSong[]) => {
    for (const row of items) {
      insert.run({
        id: row.id,
        title: row.title,
        artist: row.artist,
        play_config_id: row.playConfig.id,
        play_config_timestamp: row.playConfig.timestamp ?? null,
        spotify_url: row.spotifyUrl ?? null,
      });
    }
  });
  tx(rows);
  return rows.length;
}

function seedPlaylists(force?: boolean) {
  if (!shouldSeed("playlists", force)) return 0;

  const db = getDb();
  if (force) db.prepare("DELETE FROM playlists").run();

  const rows = loadAllSeedData().playlists;
  const insert = db.prepare(
    "INSERT INTO playlists (id, mood, name, description, cover, spotify_url, youtube_music_url) VALUES (@id, @mood, @name, @description, @cover, @spotify_url, @youtube_music_url)"
  );
  const tx = db.transaction((items: SeedPlaylist[]) => {
    for (const row of items) {
      insert.run({
        id: row.id,
        mood: row.mood,
        name: row.name,
        description: row.description ?? null,
        cover: row.cover,
        spotify_url: row.spotifyUrl ?? null,
        youtube_music_url: row.youtubeMusicUrl ?? null,
      });
    }
  });
  tx(rows);
  return rows.length;
}

function seedLyrics(force?: boolean) {
  if (!shouldSeed("lyrics", force)) return 0;

  const db = getDb();
  if (force) db.prepare("DELETE FROM lyrics").run();

  const rows = loadAllSeedData().lyrics;
  const insert = db.prepare(
    "INSERT INTO lyrics (id, lyric, artist, song, accent) VALUES (@id, @lyric, @artist, @song, @accent)"
  );
  const tx = db.transaction((items: SeedLyric[]) => {
    for (const row of items) insert.run(row);
  });
  tx(rows);
  return rows.length;
}

export function seedDatabase(options: SeedOptions = {}) {
  const { force = false } = options;

  const counts = {
    movies: seedMovies(force),
    comics: seedComics(force),
    anime: seedAnime(force),
    songs: seedSongs(force),
    playlists: seedPlaylists(force),
    lyrics: seedLyrics(force),
  };

  return counts;
}

export function seedDatabaseIfEmpty() {
  return seedDatabase({ force: false });
}
