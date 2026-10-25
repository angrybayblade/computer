export type Sticker = {
  id: string;
  src: string;
  width: number;
  height: number;
  createdAt: string;
};

export type StoredSticker = Sticker & {
  fileName: string;
};
