import { metadataForApp, RoutedApp } from "../_components/RoutedApp";

export const metadata = metadataForApp("comics");

export default function ComicsPage() {
  return <RoutedApp id="comics" />;
}
