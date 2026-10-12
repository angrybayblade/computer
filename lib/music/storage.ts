import { fetchMetadata } from "@/lib/metadata/client";
import { type ListeningHistoryTrack, type Lyric, type Playlist, type Song } from "./types";

export function groupPlaylistsByMood(playlists: Playlist[]) {
  const groups = new Map<string, Playlist[]>();

  for (const playlist of playlists) {
    const existing = groups.get(playlist.mood) ?? [];
    existing.push(playlist);
    groups.set(playlist.mood, existing);
  }

  return [...groups.entries()].map(([mood, items]) => ({ mood, playlists: items }));
}

export async function fetchSongs(): Promise<Song[]> {
  return fetchMetadata<Song>("songs");
}

export async function fetchPlaylists(): Promise<Playlist[]> {
  return fetchMetadata<Playlist>("playlists");
}

export async function fetchLyrics(): Promise<Lyric[]> {
  return fetchMetadata<Lyric>("lyrics");
}

export async function fetchListeningHistory(): Promise<ListeningHistoryTrack[]> {
  const response = await fetch("/api/music/history", { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to load listening history");
  return response.json() as Promise<ListeningHistoryTrack[]>;
}
