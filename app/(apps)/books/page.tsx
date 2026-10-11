import { metadataForApp, RoutedApp } from "../_components/RoutedApp";

export const metadata = metadataForApp("books");

export default function BooksPage() {
  return <RoutedApp id="books" />;
}
