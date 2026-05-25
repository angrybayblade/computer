import { SEED_LYRICS, SEED_PLAYLISTS, SEED_SONGS } from "./data";
import { type Lyric, type Playlist, type Song } from "./types";

export function loadSongs(): Song[] {
  return SEED_SONGS;
}

export function loadPlaylists(): Playlist[] {
  return SEED_PLAYLISTS;
}

export function loadLyrics(): Lyric[] {
  return SEED_LYRICS;
}

export function groupPlaylistsByMood(playlists: Playlist[]) {
  const groups = new Map<string, Playlist[]>();

  for (const playlist of playlists) {
    const existing = groups.get(playlist.mood) ?? [];
    existing.push(playlist);
    groups.set(playlist.mood, existing);
  }

  return [...groups.entries()].map(([mood, items]) => ({ mood, playlists: items }));
}
