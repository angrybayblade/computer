import { SEED_ANIME } from "./data";
import { type Anime } from "./types";

const STORAGE_KEY = "anime-collection";

const seedById = new Map(SEED_ANIME.map((entry) => [entry.id, entry]));

function mergeWithSeed(anime: Anime[]): Anime[] {
  return anime.map((entry) => {
    const seed = seedById.get(entry.id);
    if (!seed) return entry;
    return {
      ...seed,
      ...entry,
      description: entry.description || seed.description,
    };
  });
}

export function sortAnimeByRating(anime: Anime[]) {
  return [...anime].sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name));
}

export function loadAnime(): Anime[] {
  if (typeof window === "undefined") return sortAnimeByRating(SEED_ANIME);

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return sortAnimeByRating(SEED_ANIME);
    const parsed = JSON.parse(raw) as Anime[];
    return Array.isArray(parsed) && parsed.length > 0
      ? sortAnimeByRating(mergeWithSeed(parsed))
      : sortAnimeByRating(SEED_ANIME);
  } catch {
    return sortAnimeByRating(SEED_ANIME);
  }
}

export function saveAnime(anime: Anime[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(anime));
}
