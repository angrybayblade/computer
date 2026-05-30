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
      <rect x="3" y="3" width="30" height="30" fill="#0B0B0F" stroke="#2E2E3A" strokeWidth="1.25" />
      <path
        d="M18 25.1 L6 10.9 L7.1 11.6 L8.3 12.3 L9.8 13.2 L11.2 14 L12.4 15.2 L23.6 15.2 L24.8 14 L26.2 13.2 L27.7 12.3 L28.9 11.6 L30 10.9 Z"
        fill="#e12120"
      />
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
