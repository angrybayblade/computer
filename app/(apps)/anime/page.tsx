import { metadataForApp, RoutedApp } from "../_components/RoutedApp";

export const metadata = metadataForApp("anime");

export default function AnimePage() {
  return <RoutedApp id="anime" />;
}
