import { metadataForApp, RoutedApp } from "../_components/RoutedApp";

export const metadata = metadataForApp("music");

export default function MusicPage() {
  return <RoutedApp id="music" />;
}
