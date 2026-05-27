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
    <svg viewBox="0 0 36 36" width="100%" height="100%" aria-hidden>
      <rect x="4" y="4" width="30" height="30" fill="#1A1228" stroke="#1A1A1A" strokeWidth="2" />
      <rect x="8" y="11" width="22" height="16" fill="#0A0A0A" stroke="#E84545" strokeWidth="1" />
      <polygon points="16,15.5 16,22.5 22.5,19" fill="#E84545" stroke="#1A1A1A" strokeWidth="0.75" strokeLinejoin="round" />
      <rect x="8" y="28" width="22" height="2" fill="#2A2040" stroke="#1A1A1A" strokeWidth="0.5" />
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
