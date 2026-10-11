"use client";

import { useState, useEffect } from "react";
import { AppContent } from "../AppContent";
import { type AppDefinition } from "../types";
import { utilitarianTheme } from "../themes";
import { type Movie } from "@/lib/movies/types";
import { fetchMetadata } from "@/lib/metadata/client";

function formatRating(value: number) {
  return value < 0 ? String(value) : String(value).padStart(2, "0");
}

function RatingStamp({ rating }: { rating: number }) {
  const isBadGood = rating < 0;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 4,
        background: isBadGood ? "var(--app-accent-alt)" : "var(--app-accent)",
        padding: "8px 10px",
        minWidth: 72,
      }}
    >
      <span
        style={{
          fontSize: 28,
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: "-0.04em",
          color: isBadGood ? "var(--app-surface)" : "var(--app-fg)",
        }}
      >
        {formatRating(rating)}
      </span>
      <span
        style={{
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: "0.08em",
          color: isBadGood ? "var(--app-surface)" : "var(--app-fg)",
        }}
      >
        /10
      </span>
    </div>
  );
}

function MetaLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "block",
        fontSize: 9,
        fontWeight: 500,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "var(--app-muted)",
        marginBottom: 6,
      }}
    >
      {children}
    </span>
  );
}

function MoviePoster({
  movie,
  onClick,
}: {
  movie: Movie;
  onClick: () => void;
}) {
  const isBadGood = movie.rating < 0;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        width: "100%",
        padding: 0,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <div style={{ position: "relative" }}>
        <div
          style={{
            border: "1px solid var(--app-border)",
            background: "var(--app-surface)",
            overflow: "hidden",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={movie.thumb}
            alt=""
            style={{
              display: "block",
              width: "100%",
              aspectRatio: "2 / 3",
              objectFit: "cover",
              filter: "grayscale(12%) contrast(1.05)",
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 8,
            right: 8,
            background: isBadGood ? "var(--app-accent-alt)" : "var(--app-accent)",
            color: isBadGood ? "var(--app-surface)" : "var(--app-fg)",
            padding: "4px 6px",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.06em",
          }}
        >
          {formatRating(movie.rating)}/10
        </div>
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: "clamp(0.95rem, 1.4vw, 1.15rem)",
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            color: "var(--app-fg)",
          }}
        >
          {movie.name}
        </div>
        {isBadGood ? (
          <div
            style={{
              marginTop: 6,
              fontSize: 8,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--app-muted)",
            }}
          >
            So bad it&apos;s good
          </div>
        ) : null}
      </div>
    </button>
  );
}

function MovieDetail({
  movie,
  onBack,
}: {
  movie: Movie;
  onBack: () => void;
}) {
  return (
    <div
      style={{
        minHeight: "100%",
        display: "grid",
        gridTemplateRows: "auto 1fr",
      }}
    >
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid var(--app-hairline)",
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            border: "none",
            background: "transparent",
            padding: 0,
            cursor: "pointer",
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--app-fg)",
            textDecoration: "underline",
            textUnderlineOffset: 4,
          }}
        >
          Back
        </button>
      </div>

      <div
        className="movie-detail-body"
        style={{
          padding: "28px 24px 32px",
          display: "grid",
          gap: 28,
          alignItems: "start",
        }}
      >
        <div>
          <div
            style={{
              border: "1px solid var(--app-border)",
              background: "var(--app-surface)",
              marginBottom: 16,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={movie.thumb}
              alt=""
              style={{
                display: "block",
                width: "100%",
                aspectRatio: "2 / 3",
                objectFit: "cover",
                filter: "grayscale(8%) contrast(1.05)",
              }}
            />
          </div>

          <div
            style={{
              borderTop: "1px solid var(--app-hairline)",
              paddingTop: 12,
            }}
          >
            <MetaLabel>{movie.rating < 0 ? "Bad-good rating · lower is better" : "Rating"}</MetaLabel>
            <RatingStamp rating={movie.rating} />
          </div>
        </div>

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: "inline-block",
              background: "var(--app-accent-alt)",
              opacity: 0.92,
              padding: "6px 10px",
              marginBottom: 18,
            }}
          >
            <span
              style={{
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--app-surface)",
              }}
            >
              Selected entry
            </span>
          </div>

          <h1
            className="movie-detail-title"
            style={{
              margin: 0,
              fontSize: "clamp(2rem, 5vw, 3.4rem)",
              fontWeight: 700,
              lineHeight: 0.92,
              letterSpacing: "-0.04em",
              textTransform: "uppercase",
              color: "var(--app-fg)",
              maxWidth: "12ch",
            }}
          >
            {movie.name}
          </h1>

          <div
            style={{
              marginTop: 28,
              paddingTop: 18,
              borderTop: "1px solid var(--app-border)",
              gridTemplateColumns: "88px 1fr",
              gap: 20,
            }}
          >
            {movie.description}
          </div>

          <div
            className="movie-detail-footer"
            style={{
              marginTop: 32,
              paddingTop: 16,
              borderTop: "1px solid var(--app-hairline)",
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--app-muted)",
            }}
          >
            <span>Ref {movie.id}</span>
            <span>Personal archive</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MoviesAppContent({ initialMovies }: { initialMovies?: Movie[] }) {
  const [movies, setMovies] = useState<Movie[]>(initialMovies ?? []);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (initialMovies) return;
    void fetchMetadata<Movie>("movies").then(setMovies);
  }, [initialMovies]);

  const selectedMovie = movies.find((movie) => movie.id === selectedId) ?? null;
  const movieSections = [
    {
      title: "Peak",
      ratingRange: "9/10 and above",
      movies: movies.filter((movie) => movie.rating >= 9),
    },
    {
      title: "Good",
      ratingRange: "7/10 and above",
      movies: movies.filter((movie) => movie.rating >= 7 && movie.rating < 9),
    },
    {
      title: "Alright",
      ratingRange: "Above 4/10",
      movies: movies.filter((movie) => movie.rating > 4 && movie.rating < 7),
    },
    {
      title: "Meh",
      ratingRange: "Above 0/10",
      movies: movies.filter((movie) => movie.rating > 0 && movie.rating <= 4),
    },
    {
      title: "So bad it's good",
      ratingRange: "Lower is better · −1 to −10",
      movies: movies.filter((movie) => movie.rating < 0),
    },
  ].filter((section) => section.movies.length > 0);

  if (selectedMovie) {
    return <MovieDetail movie={selectedMovie} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div style={{ minHeight: "100%" }}>
      <div style={{ padding: "24px" }}>
        {movieSections.length === 0 ? (
          <div
            style={{
              padding: "48px 0",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--app-muted)",
            }}
          >
            No entries catalogued.
          </div>
        ) : (
          movieSections.map((section, index) => (
            <section
              key={section.title}
              style={index === 0 ? undefined : { marginTop: 44, paddingTop: 24, borderTop: "1px solid var(--app-border)" }}
            >
              <MetaLabel>{section.ratingRange}</MetaLabel>
              <h2
                style={{
                  margin: "0 0 20px",
                  fontSize: "clamp(1.35rem, 3vw, 2rem)",
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                  textTransform: "uppercase",
                  color: "var(--app-fg)",
                }}
              >
                {section.title}
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(168px, 1fr))",
                  gap: 24,
                }}
              >
                {section.movies.map((movie) => (
                  <MoviePoster key={movie.id} movie={movie} onClick={() => setSelectedId(movie.id)} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}

export function MoviesApp({ initialMovies }: { initialMovies?: Movie[] }) {
  return (
    <AppContent theme={utilitarianTheme.content}>
      <MoviesAppContent initialMovies={initialMovies} />
    </AppContent>
  );
}

function MoviesIcon() {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <rect x="5" y="5" width="38" height="38" fill="#F7F7F5" stroke="#111111" strokeWidth="1.5" />
      <path d="M5 5h7v38H5zM36 5h7v38h-7z" fill="#111111" />
      <path d="M7 8h3v4H7zM7 17h3v4H7zM7 27h3v4H7zM7 36h3v4H7zM38 8h3v4h-3zM38 17h3v4h-3zM38 27h3v4h-3zM38 36h3v4h-3z" fill="#F7F7F5" />
      <path d="M12 12h24v24H12z" fill="#FFD200" />
      <path d="m21 18 9 6-9 6Z" fill="#111111" />
      <path d="M12 12h24M12 36h24" stroke="#111111" strokeWidth="1.5" />
    </svg>
  );
}

export const moviesApp: AppDefinition = {
  id: "movies",
  title: "Movies",
  icon: <MoviesIcon />,
  ui: utilitarianTheme,
  width: 960,
  height: 720,
  minWidth: 520,
  minHeight: 480,
  content: <MoviesApp />,
};
