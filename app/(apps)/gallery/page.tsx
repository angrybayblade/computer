import { metadataForApp, RoutedApp } from "../_components/RoutedApp";

export const metadata = metadataForApp("gallery");

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ photo?: string | string[] }>;
}) {
  const photo = (await searchParams).photo;

  return (
    <RoutedApp
      id="gallery"
      galleryPhotoId={typeof photo === "string" ? photo : undefined}
    />
  );
}
