export type PublicAppId =
  | "welcome"
  | "resume"
  | "movies"
  | "music"
  | "comics"
  | "anime"
  | "books"
  | "blog"
  | "vines"
  | "gallery";

export type PublicAppRoute = {
  id: PublicAppId;
  path: string;
  title: string;
  description: string;
};

export const PUBLIC_APP_ROUTES: readonly PublicAppRoute[] = [
  {
    id: "welcome",
    path: "/about",
    title: "About",
    description: "Meet Viraj Patel, a software engineer known online as angrybayblade.",
  },
  {
    id: "resume",
    path: "/resume",
    title: "Resume",
    description: "Viraj Patel's engineering experience, impact, and technical skills.",
  },
  {
    id: "movies",
    path: "/movies",
    title: "Movies",
    description: "Viraj Patel's personal film recommendations and ratings.",
  },
  {
    id: "music",
    path: "/music",
    title: "Music",
    description: "Songs, playlists, and lyrics from Viraj Patel's personal collection.",
  },
  {
    id: "comics",
    path: "/comics",
    title: "Comics",
    description: "Comic-book recommendations and ratings from Viraj Patel's collection.",
  },
  {
    id: "anime",
    path: "/anime",
    title: "Anime",
    description: "Anime recommendations and ratings from Viraj Patel's personal archive.",
  },
  {
    id: "books",
    path: "/books",
    title: "Books",
    description: "Books Viraj Patel recommends, with ratings and notes.",
  },
  {
    id: "blog",
    path: "/blog",
    title: "Blog",
    description: "Essays on software, systems, and practical engineering by Viraj Patel.",
  },
  {
    id: "vines",
    path: "/vines",
    title: "Vines",
    description: "A collection of short-form video favorites curated by Viraj Patel.",
  },
  {
    id: "gallery",
    path: "/gallery",
    title: "Gallery",
    description: "A personal gallery of photographs by Viraj Patel.",
  },
];

export function getPublicAppRouteById(id: string) {
  return PUBLIC_APP_ROUTES.find((route) => route.id === id);
}

export function getPublicAppRouteByPath(pathname: string) {
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  if (normalizedPath.startsWith("/blog/")) return getPublicAppRouteById("blog");
  return PUBLIC_APP_ROUTES.find((route) => route.path === normalizedPath);
}

export function getPublicAppRouteBySlug(slug: string) {
  return PUBLIC_APP_ROUTES.find((route) => route.path === `/${slug}`);
}
