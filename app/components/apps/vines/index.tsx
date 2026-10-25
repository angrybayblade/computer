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

function VinesAppContent({ initialVine }: { initialVine?: Vine }) {
  const [vine, setVine] = useState<Vine | null>(initialVine ?? null);

  useEffect(() => {
    if (initialVine) return;
    void fetchMetadata<Vine>("vines").then((list) => {
      setVine(pickRandom(list));
    });
  }, [initialVine]);

  if (!vine) return null;

  return <VinePlayer key={vine.id} vine={vine} />;
}

export function VinesApp({ initialVine }: { initialVine?: Vine }) {
  return (
    <AppContent theme={surrealismTheme.content}>
      <VinesAppContent initialVine={initialVine} />
    </AppContent>
  );
}

function VinesIcon() {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <rect x="7" y="8" width="36" height="36" rx="3" fill="#1A1228" />
      <rect x="4" y="5" width="36" height="36" rx="3" fill="#392B54" stroke="#1A1228" strokeWidth="2" />
      <path d="M4 13h36" stroke="#1A1228" strokeWidth="2" />
      <circle cx="9" cy="9" r="1.5" fill="#F27670" />
      <circle cx="14" cy="9" r="1.5" fill="#D9A33A" />
      <path d="m17 19 13 8-13 8Z" fill="#F27670" stroke="#1A1228" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 36h24" stroke="#64527E" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M31 17a7 7 0 0 1 2 7" fill="none" stroke="#F27670" strokeWidth="1.5" strokeLinecap="round" />
      <path d="m31 17 4 1-2-4" fill="none" stroke="#F27670" strokeWidth="1.5" strokeLinejoin="round" />
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
