export type RadioSource = "youtube" | "yt-music";

export type NowPlayingTrack = {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  videoUrl: string;
  publishedAt: string | null;
  activityType: string;
  source: RadioSource;
};

export type NowPlayingResponse =
  | { status: "playing"; track: NowPlayingTrack; source: RadioSource; fetchedAt: string }
  | { status: "syncing"; message: string; source: RadioSource; fetchedAt: string }
  | { status: "idle"; message: string; source: RadioSource; fetchedAt: string }
  | { status: "error"; message: string; source: RadioSource; fetchedAt: string };

export function parseRadioSource(value: string | null | undefined): RadioSource {
  return value === "yt-music" ? "yt-music" : "youtube";
}

export function getVideoUrl(videoId: string, source: RadioSource) {
  if (source === "yt-music") {
    return `https://music.youtube.com/watch?v=${videoId}`;
  }
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function getThumbnailUrl(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export type ActivityRecord = {
  header?: string;
  title?: string;
  titleUrl?: string;
  subtitles?: { name?: string; url?: string }[];
  time?: string;
  products?: string[];
  activityControls?: string[];
};

export type RadioCache = {
  syncedAt: string | null;
  jobId: string | null;
  jobState: string | null;
  jobStartedAt: string | null;
  tracks: Partial<Record<RadioSource, NowPlayingTrack>>;
};
