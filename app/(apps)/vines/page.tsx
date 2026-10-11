import { metadataForApp, RoutedApp } from "../_components/RoutedApp";

export const metadata = metadataForApp("vines");

export default function VinesPage() {
  return <RoutedApp id="vines" />;
}
