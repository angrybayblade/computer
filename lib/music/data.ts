import { type Lyric, type Playlist, type Song } from "./types";

export const SEED_SONGS: Song[] = [
  {
    id: "count-me-out",
    title: "Count Me Out",
    artist: "Kendrick Lamar",
    playConfig: { id: "NXi9scTzyxM" },
    spotifyUrl: "https://open.spotify.com/track/2takcwOaAZSKQCjCWDG0ws",
  },
  {
    id: "the-way-i-are",
    title: "The Way I Are",
    artist: "Timbaland",
    playConfig: { id: "iM6iO8TD3tM" },
    spotifyUrl: "https://open.spotify.com/track/2g4h5gB9ROFu3VpuckG7df",
  },
  {
    id: "sorry-sorry-pawan-singh",
    title: "Sorry Sorry",
    artist: "Pawan Singh",
    playConfig: { id: "ftUWLRU5rVM" },
    spotifyUrl: "https://open.spotify.com/track/0U0ldCRjknR9Y0V1Huxrdt",
  },
];

export const SEED_PLAYLISTS: Playlist[] = [
  {
    id: "night-drive",
    mood: "Night Drive",
    name: "Orange Light Trails",
    description: "Long exposure energy for empty highways after midnight.",
    cover: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=800&fit=crop",
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DX4WYpdgoIcn6",
    youtubeMusicUrl: "https://music.youtube.com/playlist?list=RDCLAK5uy_kmPRjHDECIcuVInwzg-vJtC_3jBL1",
  },
];

export const SEED_LYRICS: Lyric[] = [
  {
    id: "blue-theme",
    lyric: "Sagar ke dil me, jitne khazane - dil ke sagar me, utne fasane",
    artist: "Raqeeb Aalam",
    song: "Blue Theme - Blue (2009)",
    accent: "#5BA4A4",
  },
];
