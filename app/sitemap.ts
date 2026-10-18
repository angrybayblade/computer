import type { MetadataRoute } from "next";
import { PUBLIC_APP_ROUTES } from "@/lib/app-routes";
import { getSiteUrl } from "@/lib/site";
import { BLOG_POSTS } from "@/lib/blog/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  return [
    {
      url: siteUrl.toString(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...PUBLIC_APP_ROUTES.map((route) => ({
      url: new URL(route.path, siteUrl).toString(),
      changeFrequency: "monthly" as const,
      priority: route.id === "resume" || route.id === "welcome" ? 0.9 : 0.7,
    })),
    ...BLOG_POSTS.map((post) => ({
      url: new URL(`/blog/${post.slug}`, siteUrl).toString(),
      lastModified: post.publishedAt,
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
  ];
}
