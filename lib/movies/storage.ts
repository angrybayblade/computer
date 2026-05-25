import { SEED_MOVIES } from "./data";
import { type Movie } from "./types";

const STORAGE_KEY = "bauhaus-movies";

export function sortMoviesByRating(movies: Movie[]) {
  return [...movies].sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name));
}

export function loadMovies(): Movie[] {
  if (typeof window === "undefined") return sortMoviesByRating(SEED_MOVIES);

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return sortMoviesByRating(SEED_MOVIES);
    const parsed = JSON.parse(raw) as Movie[];
    return Array.isArray(parsed) && parsed.length > 0
      ? sortMoviesByRating(parsed)
      : sortMoviesByRating(SEED_MOVIES);
  } catch {
    return sortMoviesByRating(SEED_MOVIES);
  }
}

export function saveMovies(movies: Movie[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
}

export function createMovieId(name: string) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return slug ? `${slug}-${Date.now()}` : `movie-${Date.now()}`;
}
