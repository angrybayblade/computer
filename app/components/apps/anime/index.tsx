"use client";

import { useState, useEffect } from "react";
import { AppContent } from "../AppContent";
import { type AppDefinition } from "../types";
import { animeTheme } from "../themes";
import { type Anime } from "@/lib/anime/types";
import { fetchMetadata } from "@/lib/metadata/client";

function formatRating(value: number) {
  return String(value).padStart(2, "0");
}

function AnimeCard({
  anime,
  index,
  onClick,
}: {
  anime: Anime;
  index: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="anime-card"
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={onClick}
    >
      <div className="anime-card-cover">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={anime.thumb} alt="" />
        <div className="anime-rating-badge">
          {formatRating(anime.rating)}/10
        </div>
      </div>
      <h2 className="anime-card-title">{anime.name}</h2>
    </button>
  );
}

function AnimeDetail({
  anime,
  onBack,
}: {
  anime: Anime;
  onBack: () => void;
}) {
  return (
    <div className="anime-detail">
      <div className="anime-detail-header">
        <button type="button" className="anime-detail-back" onClick={onBack}>
          Back
        </button>
      </div>

      <div className="anime-detail-body">
        <div className="anime-detail-side">
          <div className="anime-detail-poster">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={anime.thumb} alt="" />
          </div>

          <div className="anime-detail-rating-block">
            <span className="anime-detail-label">Rating</span>
            <div className="anime-detail-rating-stamp">
              <span className="anime-detail-rating-value">{formatRating(anime.rating)}</span>
              <span className="anime-detail-rating-suffix">/10</span>
            </div>
          </div>
        </div>

        <div className="anime-detail-main">
          <span className="anime-detail-tag">Selected entry</span>
          <h1 className="anime-detail-title">{anime.name}</h1>

          <div className="anime-detail-description">{anime.description}</div>

          <div className="anime-detail-footer">
            <span>Ref {anime.id}</span>
            <span>Personal archive</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnimeAppContent() {
  const [anime, setAnime] = useState<Anime[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    void fetchMetadata<Anime>("anime").then(setAnime);
  }, []);

  const selectedAnime = anime.find((entry) => entry.id === selectedId) ?? null;

  if (selectedAnime) {
    return <AnimeDetail anime={selectedAnime} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="anime-grid-wrap">
      <div className="anime-texture" aria-hidden />
      <div className="anime-scanlines" aria-hidden />
      <div className="anime-grid">
        {anime.map((entry, index) => (
          <AnimeCard
            key={entry.id}
            anime={entry}
            index={index}
            onClick={() => setSelectedId(entry.id)}
          />
        ))}
      </div>
    </div>
  );
}

export function AnimeApp() {
  return (
    <AppContent theme={animeTheme.content}>
      <AnimeAppContent />
    </AppContent>
  );
}

function AnimeIcon() {
  return (
    <svg viewBox="0 0 36 36" width="100%" height="100%" aria-hidden>
      <rect x="4" y="4" width="28" height="28" fill="#0B0B0F" stroke="#2E2E3A" strokeWidth="1.5" />
      <circle cx="18" cy="18" r="9" fill="#e12120" stroke="#E8E4DC" strokeWidth="1" />
      <circle cx="18" cy="18" r="3" fill="#FFB800" />
      <line x1="4" y1="32" x2="32" y2="32" stroke="#e12120" strokeWidth="2" />
    </svg>
  );
}

export const animeApp: AppDefinition = {
  id: "anime",
  title: "Anime",
  icon: <AnimeIcon />,
  ui: animeTheme,
  width: 880,
  height: 640,
  minWidth: 480,
  minHeight: 400,
  content: <AnimeApp />,
};
