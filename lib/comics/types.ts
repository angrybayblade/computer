export type Comic = {
  id: string;
  name: string;
  thumb: string;
  rating: number;
};

export type NewComic = Omit<Comic, "id">;
