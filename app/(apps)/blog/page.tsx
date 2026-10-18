import { BlogApp } from "@/app/components/apps/blog";
import { metadataForApp } from "../_components/RoutedApp";

export const metadata = metadataForApp("blog");

export default function BlogPage() {
  return <BlogApp />;
}
