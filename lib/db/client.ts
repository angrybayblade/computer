import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DB_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DB_DIR, "app.sqlite");

let db: Database.Database | null = null;

function initSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS movies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      thumb TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      rating REAL NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS comics (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      thumb TEXT NOT NULL,
      rating REAL NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS anime (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      thumb TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      rating REAL NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS songs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      play_config_id TEXT NOT NULL,
      play_config_timestamp INTEGER,
      spotify_url TEXT
    );

    CREATE TABLE IF NOT EXISTS playlists (
      id TEXT PRIMARY KEY,
      mood TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      cover TEXT NOT NULL,
      spotify_url TEXT,
      youtube_music_url TEXT
    );

    CREATE TABLE IF NOT EXISTS lyrics (
      id TEXT PRIMARY KEY,
      lyric TEXT NOT NULL,
      artist TEXT NOT NULL,
      song TEXT NOT NULL,
      accent TEXT
    );

    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      thumb TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      rating REAL NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS vines (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      video_id TEXT NOT NULL,
      start_time REAL NOT NULL,
      end_time REAL NOT NULL
    );
  `);
}

export function getDb() {
  if (db) return db;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  initSchema(db);
  return db;
}
