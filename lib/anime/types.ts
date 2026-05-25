export type Anime = {
  id: string;
  name: string;
  thumb: string;
  description: string;
  rating: number;
};

export type NewAnime = Omit<Anime, "id">;
