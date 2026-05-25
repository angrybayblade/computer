import { SEED_COMICS } from "./data";
import { type Comic } from "./types";

const STORAGE_KEY = "midcentury-comics";

export function sortComicsByRating(comics: Comic[]) {
  return [...comics].sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name));
}

export function loadComics(): Comic[] {
  if (typeof window === "undefined") return sortComicsByRating(SEED_COMICS);

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return sortComicsByRating(SEED_COMICS);
    const parsed = JSON.parse(raw) as Comic[];
    return Array.isArray(parsed) && parsed.length > 0
      ? sortComicsByRating(parsed)
      : sortComicsByRating(SEED_COMICS);
  } catch {
    return sortComicsByRating(SEED_COMICS);
  }
}

export function saveComics(comics: Comic[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(comics));
}
