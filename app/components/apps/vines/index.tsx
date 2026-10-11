"use client";

import { useEffect, useMemo, useState } from "react";
import { AppContent } from "../AppContent";
import { type AppDefinition } from "../types";
import { surrealismTheme } from "../themes";
import { type Vine } from "@/lib/vines/types";
import { fetchMetadata } from "@/lib/metadata/client";

function pickRandom(vines: Vine[]) {
  if (vines.length === 0) return null;
  return vines[Math.floor(Math.random() * vines.length)] ?? null;
}

function VinePlayer({ vine }: { vine: Vine }) {
  const embedUrl = useMemo(() => {
    const params = new URLSearchParams({
      autoplay: "1",
      start: String(vine.startTime),
      end: String(vine.endTime),
      controls: "0",
      modestbranding: "1",
      rel: "0",
      playsinline: "1",
    });
    return `https://www.youtube.com/embed/${vine.videoId}?${params.toString()}`;
  }, [vine]);

  return (
    <iframe
      src={embedUrl}
      className="vines-player"
      allow="autoplay; encrypted-media; picture-in-picture"
      title="Vine"
    />
  );
}

function VinesAppContent() {
  const [vine, setVine] = useState<Vine | null>(null);

  useEffect(() => {
    void fetchMetadata<Vine>("vines").then((list) => {
      setVine(pickRandom(list));
    });
  }, []);

  if (!vine) return null;

  return <VinePlayer key={vine.id} vine={vine} />;
}

export function VinesApp() {
  return (
    <AppContent theme={surrealismTheme.content}>
      <VinesAppContent />
    </AppContent>
  );
}

function VinesIcon() {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <rect x="6" y="15" width="37" height="28" rx="7" fill="#1A1228" />
      <rect x="3" y="12" width="37" height="28" rx="7" fill="#392B54" stroke="#1A1228" strokeWidth="2" />
      <path d="M10 18h23" stroke="#64527E" strokeWidth="1.5" strokeLinecap="round" />
      <path d="m18 20 11 7-11 7Z" fill="#F27670" stroke="#F27670" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 10a13 13 0 0 1 23-1" fill="none" stroke="#E84545" strokeWidth="3" strokeLinecap="round" />
      <path d="m30 9 6 2 1-6" fill="none" stroke="#E84545" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="34" r="1" fill="#F27670" />
    </svg>
  );
}

export const vinesApp: AppDefinition = {
  id: "vines",
  title: "Vines",
  icon: <VinesIcon />,
  ui: surrealismTheme,
  width: 640,
  height: 360,
  minWidth: 320,
  minHeight: 180,
  content: <VinesApp />,
};
