import { ensureHistorySynced } from "@/lib/dataportability/sync";
import type { NowPlayingResponse, RadioSource } from "@/lib/radio/types";

function idleMessage(source: RadioSource) {
  return source === "yt-music"
    ? "No recent YouTube Music watch history found."
    : "No recent YouTube watch history found.";
}

export async function getNowPlaying(source: RadioSource): Promise<NowPlayingResponse> {
  const fetchedAt = new Date().toISOString();

  try {
    const { cache, syncing, state } = await ensureHistorySynced();

    if (syncing) {
      return {
        status: "syncing",
        message:
          state === "IN_PROGRESS"
            ? "Syncing watch history from Google Data Portability..."
            : `Sync in progress (${state ?? "pending"})...`,
        source,
        fetchedAt,
      };
    }

    const track = cache.tracks[source];

    if (!track) {
      return {
        status: "idle",
        message: idleMessage(source),
        source,
        fetchedAt,
      };
    }

    return { status: "playing", track, source, fetchedAt };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Failed to sync watch history from Data Portability API.",
      source,
      fetchedAt,
    };
  }
}
