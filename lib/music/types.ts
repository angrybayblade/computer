export type PlayConfig = {
  id: string;
  timestamp?: number;
};

export type Song = {
  id: string;
  title: string;
  artist: string;
  playConfig: PlayConfig;
  spotifyUrl?: string;
};

export type Playlist = {
  id: string;
  mood: string;
  name: string;
  description?: string;
  cover: string;
  spotifyUrl?: string;
  youtubeMusicUrl?: string;
};

export type Lyric = {
  id: string;
  lyric: string;
  artist: string;
  song: string;
  accent?: string;
};
