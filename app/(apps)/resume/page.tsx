import { metadataForApp, RoutedApp } from "../_components/RoutedApp";

export const metadata = metadataForApp("resume");

export default function ResumePage() {
  return <RoutedApp id="resume" />;
}
