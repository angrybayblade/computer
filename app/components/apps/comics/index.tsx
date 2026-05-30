"use client";

import { useState, useEffect } from "react";
import { AppContent } from "../AppContent";
import { type AppDefinition } from "../types";
import { midcenturyTheme } from "../themes";
import { type Comic } from "@/lib/comics/types";
import { fetchMetadata } from "@/lib/metadata/client";

function formatRating(value: number) {
  return String(value).padStart(2, "0");
}

function ComicCard({ comic, index }: { comic: Comic; index: number }) {
  return (
    <article className="midcentury-card" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="midcentury-card-cover">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={comic.thumb} alt="" />
        <div className="midcentury-rating-badge">
          {formatRating(comic.rating)}/10
        </div>
      </div>
      <h2 className="midcentury-card-title">{comic.name}</h2>
    </article>
  );
}

function ComicsAppContent() {
  const [comics, setComics] = useState<Comic[]>([]);

  useEffect(() => {
    void fetchMetadata<Comic>("comics").then(setComics);
  }, []);

  return (
    <div className="midcentury-grid-wrap">
      <div className="midcentury-grid">
        {comics.map((comic, index) => (
          <ComicCard key={comic.id} comic={comic} index={index} />
        ))}
      </div>
    </div>
  );
}

export function ComicsApp() {
  return (
    <AppContent theme={midcenturyTheme.content}>
      <ComicsAppContent />
    </AppContent>
  );
}

function ComicsIcon() {
  return (
    <svg viewBox="0 0 36 36" width="100%" height="100%" aria-hidden>
      <rect x="3" y="3" width="30" height="30" fill="#FAF6F0" stroke="#1A1A1A" strokeWidth="1.5" />
      <ellipse cx="18" cy="15.5" rx="2.8" ry="3.4" fill="#1B365D" />
      <path
        d="M18 17.5 L10 9 M18 17.5 L26 9 M18 17.5 L8 14 M18 17.5 L28 14 M18 17.5 L8.5 19.5 M18 17.5 L27.5 19.5 M18 17.5 L11 25 M18 17.5 L25 25"
        stroke="#1B365D"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <circle cx="18" cy="14.8" r="0.55" fill="#D4A843" />
    </svg>
  );
}

export const comicsApp: AppDefinition = {
  id: "comics",
  title: "Comics",
  icon: <ComicsIcon />,
  ui: midcenturyTheme,
  width: 880,
  height: 640,
  minWidth: 480,
  minHeight: 400,
  content: <ComicsApp />,
};
