import { metadataForApp, RoutedApp } from "../_components/RoutedApp";

export const metadata = metadataForApp("welcome");

export default function AboutPage() {
  return <RoutedApp id="welcome" />;
}
