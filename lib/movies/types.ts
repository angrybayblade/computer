export type Movie = {
  id: string;
  name: string;
  thumb: string;
  description: string;
  rating: number;
};

export type NewMovie = Omit<Movie, "id">;
