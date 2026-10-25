import { metadataForApp, RoutedApp } from "../_components/RoutedApp";

export const metadata = metadataForApp("stickers");

export default async function StickersPage({
  searchParams,
}: {
  searchParams: Promise<{ sticker?: string | string[] }>;
}) {
  const sticker = (await searchParams).sticker;

  return (
    <RoutedApp
      id="stickers"
      selectedStickerId={typeof sticker === "string" ? sticker : undefined}
    />
  );
}
