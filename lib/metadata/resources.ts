export type ResourceSlug = "movies" | "comics" | "anime" | "songs" | "playlists" | "lyrics" | "books" | "vines";

export type FieldType = "text" | "url" | "number" | "textarea";

export type FieldConfig = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
};

export type ResourceConfig = {
  slug: ResourceSlug;
  label: string;
  fields: FieldConfig[];
  listColumns: { key: string; label: string }[];
};

export const RESOURCE_CONFIGS: ResourceConfig[] = [
  {
    slug: "movies",
    label: "Movies",
    listColumns: [
      { key: "name", label: "Name" },
      { key: "rating", label: "Rating" },
    ],
    fields: [
      { key: "id", label: "ID", type: "text", placeholder: "Auto-generated if empty" },
      { key: "name", label: "Name", type: "text", required: true },
      { key: "thumb", label: "Thumbnail URL", type: "url", required: true },
      { key: "description", label: "Description", type: "textarea", required: true },
      { key: "rating", label: "Rating", type: "number", required: true },
    ],
  },
  {
    slug: "comics",
    label: "Comics",
    listColumns: [
      { key: "name", label: "Name" },
      { key: "rating", label: "Rating" },
    ],
    fields: [
      { key: "id", label: "ID", type: "text", placeholder: "Auto-generated if empty" },
      { key: "name", label: "Name", type: "text", required: true },
      { key: "thumb", label: "Thumbnail URL", type: "url", required: true },
      { key: "rating", label: "Rating", type: "number", required: true },
    ],
  },
  {
    slug: "anime",
    label: "Anime",
    listColumns: [
      { key: "name", label: "Name" },
      { key: "rating", label: "Rating" },
    ],
    fields: [
      { key: "id", label: "ID", type: "text", placeholder: "Auto-generated if empty" },
      { key: "name", label: "Name", type: "text", required: true },
      { key: "thumb", label: "Thumbnail URL", type: "url", required: true },
      { key: "description", label: "Description", type: "textarea", required: true },
      { key: "rating", label: "Rating", type: "number", required: true },
    ],
  },
  {
    slug: "songs",
    label: "Songs",
    listColumns: [
      { key: "title", label: "Title" },
      { key: "artist", label: "Artist" },
    ],
    fields: [
      { key: "id", label: "ID", type: "text", placeholder: "Auto-generated if empty" },
      { key: "title", label: "Title", type: "text", required: true },
      { key: "artist", label: "Artist", type: "text", required: true },
      { key: "play_config_id", label: "YouTube Video ID", type: "text", required: true },
      { key: "play_config_timestamp", label: "Start Timestamp (seconds)", type: "number" },
      { key: "spotify_url", label: "Spotify URL", type: "url" },
    ],
  },
  {
    slug: "playlists",
    label: "Playlists",
    listColumns: [
      { key: "name", label: "Name" },
      { key: "mood", label: "Mood" },
    ],
    fields: [
      { key: "id", label: "ID", type: "text", placeholder: "Auto-generated if empty" },
      { key: "mood", label: "Mood", type: "text", required: true },
      { key: "name", label: "Name", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "cover", label: "Cover URL", type: "url", required: true },
      { key: "spotify_url", label: "Spotify URL", type: "url" },
      { key: "youtube_music_url", label: "YouTube Music URL", type: "url" },
    ],
  },
  {
    slug: "lyrics",
    label: "Lyrics",
    listColumns: [
      { key: "song", label: "Song" },
      { key: "artist", label: "Artist" },
    ],
    fields: [
      { key: "id", label: "ID", type: "text", placeholder: "Auto-generated if empty" },
      { key: "lyric", label: "Lyric", type: "textarea", required: true },
      { key: "artist", label: "Artist", type: "text", required: true },
      { key: "song", label: "Song", type: "text", required: true },
      { key: "accent", label: "Accent Color", type: "text", placeholder: "#5BA4A4" },
    ],
  },
  {
    slug: "books",
    label: "Books",
    listColumns: [
      { key: "title", label: "Title" },
      { key: "author", label: "Author" },
      { key: "rating", label: "Rating" },
    ],
    fields: [
      { key: "id", label: "ID", type: "text", placeholder: "Auto-generated if empty" },
      { key: "title", label: "Title", type: "text", required: true },
      { key: "author", label: "Author", type: "text", required: true },
      { key: "thumb", label: "Cover URL", type: "url", required: true },
      { key: "description", label: "Description", type: "textarea", required: true },
      { key: "rating", label: "Rating", type: "number", required: true },
    ],
  },
  {
    slug: "vines",
    label: "Vines",
    listColumns: [
      { key: "title", label: "Title" },
      { key: "video_id", label: "Video ID" },
    ],
    fields: [
      { key: "id", label: "ID", type: "text", placeholder: "Auto-generated if empty" },
      { key: "title", label: "Title", type: "text", required: true },
      { key: "video_id", label: "YouTube Video ID", type: "text", required: true },
      { key: "start_time", label: "Start Time (seconds)", type: "number", required: true },
      { key: "end_time", label: "End Time (seconds)", type: "number", required: true },
    ],
  },
];

export function getResourceConfig(slug: string): ResourceConfig | undefined {
  return RESOURCE_CONFIGS.find((config) => config.slug === slug);
}

export function isResourceSlug(slug: string): slug is ResourceSlug {
  return RESOURCE_CONFIGS.some((config) => config.slug === slug);
}

export function createResourceId(label: string, prefix: string) {
  const slug = label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return slug ? `${slug}-${Date.now()}` : `${prefix}-${Date.now()}`;
}
