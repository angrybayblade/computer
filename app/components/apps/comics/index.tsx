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
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <rect x="6" y="7" width="36" height="36" rx="2" fill="#1B365D" />
      <rect x="3" y="4" width="36" height="36" rx="2" fill="#FAF6F0" stroke="#1B365D" strokeWidth="2" />
      <path d="M6 7h12v30H6z" fill="#D4A843" />
      <path d="M21 7h15v13H21z" fill="#1B365D" />
      <path d="M21 23h15v14H21z" fill="#D4A843" />
      <path
        d="M17 12h17a6 6 0 0 1 6 6v3a6 6 0 0 1-6 6h-9l-7 6v-6h-1a6 6 0 0 1-6-6v-3a6 6 0 0 1 6-6Z"
        fill="#FAF6F0"
        stroke="#1B365D"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M19 19h13M19 23h8" stroke="#1B365D" strokeWidth="2" strokeLinecap="round" />
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
