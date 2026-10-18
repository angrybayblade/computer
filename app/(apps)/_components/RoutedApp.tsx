import type { Metadata } from "next";
import { connection } from "next/server";
import { WelcomeApp } from "@/app/components/apps/welcome";
import { ResumeApp } from "@/app/components/apps/resume";
import { MoviesApp } from "@/app/components/apps/movies";
import { MusicApp } from "@/app/components/apps/music";
import { ComicsApp } from "@/app/components/apps/comics";
import { AnimeApp } from "@/app/components/apps/anime";
import { BooksApp } from "@/app/components/apps/books";
import { BlogApp } from "@/app/components/apps/blog";
import { VinesApp } from "@/app/components/apps/vines";
import { listResource } from "@/lib/db/repositories";
import { getPublicAppRouteById, type PublicAppId } from "@/lib/app-routes";
import { SITE_NAME } from "@/lib/site";
import type { Movie } from "@/lib/movies/types";
import type { Song, Playlist, Lyric } from "@/lib/music/types";
import type { Comic } from "@/lib/comics/types";
import type { Anime } from "@/lib/anime/types";
import type { Book } from "@/lib/books/types";
import type { Vine } from "@/lib/vines/types";

export function metadataForApp(id: PublicAppId): Metadata {
  const route = getPublicAppRouteById(id);
  if (!route) throw new Error(`Unknown public app: ${id}`);

  return {
    title: route.title,
    description: route.description,
    alternates: { canonical: route.path },
    openGraph: {
      type: "website",
      url: route.path,
      title: `${route.title} | ${SITE_NAME}`,
      description: route.description,
    },
    twitter: {
      card: "summary",
      title: `${route.title} | ${SITE_NAME}`,
      description: route.description,
    },
  };
}

async function getResource<T>(slug: Parameters<typeof listResource>[0]) {
  return (await listResource(slug)) as T[];
}

export async function RoutedApp({ id }: { id: PublicAppId }) {
  await connection();

  switch (id) {
    case "welcome":
      return <WelcomeApp />;
    case "resume":
      return <ResumeApp />;
    case "movies":
      return <MoviesApp initialMovies={await getResource<Movie>("movies")} />;
    case "music": {
      const [songs, playlists, lyrics] = await Promise.all([
        getResource<Song>("songs"),
        getResource<Playlist>("playlists"),
        getResource<Lyric>("lyrics"),
      ]);
      return (
        <MusicApp
          initialSongs={songs}
          initialPlaylists={playlists}
          initialLyrics={lyrics}
        />
      );
    }
    case "comics":
      return <ComicsApp initialComics={await getResource<Comic>("comics")} />;
    case "anime":
      return <AnimeApp initialAnime={await getResource<Anime>("anime")} />;
    case "books":
      return <BooksApp initialBooks={await getResource<Book>("books")} />;
    case "blog":
      return <BlogApp />;
    case "vines": {
      const vines = await getResource<Vine>("vines");
      return <VinesApp initialVine={vines[0]} />;
    }
  }
}
