import { metadataForApp, RoutedApp } from "../_components/RoutedApp";

export const metadata = metadataForApp("gallery");

export default function GalleryPage() {
  return <RoutedApp id="gallery" />;
}
