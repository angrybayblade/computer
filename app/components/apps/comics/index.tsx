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
      <rect x="5" y="6" width="26" height="24" fill="#FAF6F0" stroke="#1A1A1A" strokeWidth="1.5" />
      <circle cx="18" cy="16" r="6" fill="#D4A843" stroke="#1A1A1A" strokeWidth="1.5" />
      <path d="M8 28 L14 22 L22 26 L28 20" fill="none" stroke="#1B365D" strokeWidth="2" strokeLinecap="round" />
      <rect x="24" y="8" width="5" height="3" fill="#C45D2C" />
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
