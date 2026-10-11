"use client";

import { useState, useEffect, useId } from "react";
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

function AnimeAppContent({ initialAnime }: { initialAnime?: Anime[] }) {
  const [anime, setAnime] = useState<Anime[]>(initialAnime ?? []);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (initialAnime) return;
    void fetchMetadata<Anime>("anime").then(setAnime);
  }, [initialAnime]);

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

export function AnimeApp({ initialAnime }: { initialAnime?: Anime[] }) {
  return (
    <AppContent theme={animeTheme.content}>
      <AnimeAppContent initialAnime={initialAnime} />
    </AppContent>
  );
}

function AnimeIcon() {
  const id = useId();
  const gradientId = `${id}-red`;
  const glowId = `${id}-glow`;
  const emblem = "M5 11 21 21 23 24 20 27 24 31 28 27 25 24 27 21 43 11 32 23 29 25 31 28 24 36 17 28 19 25 16 23Z";

  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="24" y1="11" x2="24" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EF2028" />
          <stop offset="0.55" stopColor="#FF474B" />
          <stop offset="1" stopColor="#FF8A87" />
        </linearGradient>
        <filter id={glowId} x="-30%" y="-40%" width="160%" height="180%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>
      <rect x="3" y="3" width="42" height="42" rx="4" fill="#09090C" stroke="#29292F" />
      <path d={emblem} fill="#FF1824" filter={`url(#${glowId})`} opacity="0.85" />
      <path d={emblem} fill={`url(#${gradientId})`} />
      <path d="m10 14 11 9 2 1-3 3 4 6 4-6-3-3 2-1 11-9" fill="none" stroke="#FFB1AA" strokeWidth="0.65" strokeLinejoin="round" opacity="0.5" />
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
