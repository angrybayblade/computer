import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogApp } from "@/app/components/apps/blog";
import { getBlogPost } from "@/lib/blog/posts";
import { SITE_NAME } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getBlogPost((await params).slug);
  if (!post) return {};
  return { title: post.title, description: post.description, alternates: { canonical: `/blog/${post.slug}` }, openGraph: { type: "article", title: `${post.title} | ${SITE_NAME}`, description: post.description, publishedTime: post.publishedAt, authors: ["Viraj Patel"] } };
}

export default async function BlogPostPage({ params }: Props) {
  const post = getBlogPost((await params).slug);
  if (!post) notFound();
  return <BlogApp post={post} />;
}
