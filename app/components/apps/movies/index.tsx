"use client";

import { useState } from "react";
import { AppContent } from "../AppContent";
import { type AppDefinition } from "../types";
import { utilitarianTheme } from "../themes";
import { loadMovies } from "@/lib/movies/storage";
import { type Movie } from "@/lib/movies/types";

function formatRating(value: number) {
  return String(value).padStart(2, "0");
}

function RatingStamp({ rating }: { rating: number }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 4,
        background: "var(--app-accent)",
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
          color: "var(--app-fg)",
        }}
      >
        {formatRating(rating)}
      </span>
      <span
        style={{
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: "0.08em",
          color: "var(--app-fg)",
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
            background: "var(--app-accent)",
            color: "var(--app-fg)",
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
        style={{
          padding: "28px 24px 32px",
          display: "grid",
          gridTemplateColumns: "minmax(180px, 240px) minmax(0, 1fr)",
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
            <MetaLabel>Rating</MetaLabel>
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

function MoviesAppContent() {
  const [movies] = useState<Movie[]>(() => loadMovies());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedMovie = movies.find((movie) => movie.id === selectedId) ?? null;

  if (selectedMovie) {
    return <MovieDetail movie={selectedMovie} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div style={{ minHeight: "100%" }}>
      <div
        style={{
          padding: "24px 24px 12px",
          borderBottom: "1px solid var(--app-border)",
        }}
      >
        <MetaLabel>Recommendations</MetaLabel>
        <h1
          style={{
            margin: 0,
            fontSize: "clamp(2rem, 4vw, 2.75rem)",
            fontWeight: 700,
            lineHeight: 0.92,
            letterSpacing: "-0.04em",
            textTransform: "uppercase",
            color: "var(--app-fg)",
          }}
        >
          Films
        </h1>
      </div>

      <div style={{ padding: "24px" }}>
        {movies.length === 0 ? (
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(168px, 1fr))",
              gap: 24,
            }}
          >
            {movies.map((movie) => (
              <MoviePoster
                key={movie.id}
                movie={movie}
                onClick={() => setSelectedId(movie.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function MoviesApp() {
  return (
    <AppContent theme={utilitarianTheme.content}>
      <MoviesAppContent />
    </AppContent>
  );
}

function MoviesIcon() {
  return (
    <svg viewBox="0 0 36 36" width="100%" height="100%" aria-hidden>
      <rect x="6" y="8" width="24" height="20" fill="var(--color-bauhaus-white)" stroke="var(--color-bauhaus-black)" strokeWidth="1.5" />
      <line x1="6" y1="14" x2="30" y2="14" stroke="var(--color-bauhaus-black)" strokeWidth="1.5" />
      <line x1="6" y1="20" x2="30" y2="20" stroke="var(--color-bauhaus-black)" strokeWidth="1.5" />
      <line x1="6" y1="26" x2="30" y2="26" stroke="var(--color-bauhaus-black)" strokeWidth="1.5" />
      <rect x="24" y="10" width="4" height="2" fill="#FFD200" />
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
