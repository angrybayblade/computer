export type Photo = {
  id: string;
  src: string;
  width: number;
  height: number;
  createdAt: string;
};

export type StoredPhoto = Photo & {
  fileName: string;
};
