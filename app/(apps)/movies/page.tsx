import { metadataForApp, RoutedApp } from "../_components/RoutedApp";

export const metadata = metadataForApp("movies");

export default function MoviesPage() {
  return <RoutedApp id="movies" />;
}
