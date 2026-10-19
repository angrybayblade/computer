"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppContent } from "../AppContent";
import { type AppDefinition } from "../types";
import { blogTheme } from "../themes/blog";
import { BLOG_POSTS, type BlogPost } from "@/lib/blog/posts";

function dateLabel(date: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(date),
  );
}

function withQuery(path: string, query: string) {
  return query ? `${path}?${query}` : path;
}

function BlogIndex({ query }: { query: string }) {
  return (
    <main className="blog-index">
      <header className="blog-masthead">
        <span className="blog-kicker">Notebook / 001</span>
        <h1>Thoughts with<br /><em>rough edges.</em></h1>
        <p>Essays on software, systems, and the people caught between them.</p>
      </header>
      <section className="blog-post-list" aria-label="Posts">
        {BLOG_POSTS.map((post, index) => (
          <article className="blog-post-card" key={post.slug}>
            <span className="blog-post-number">0{index + 1}</span>
            <div>
              <time dateTime={post.publishedAt}>{dateLabel(post.publishedAt)}</time>
              <h2><Link href={withQuery(`/blog/${post.slug}`, query)}>{post.title}</Link></h2>
              <p>{post.description}</p>
            </div>
            <Link className="blog-read-link" href={withQuery(`/blog/${post.slug}`, query)} aria-label={`Read ${post.title}`}>Read →</Link>
          </article>
        ))}
      </section>
      <footer className="blog-footer">Written by Viraj Patel · <a href="https://angrybayblade.substack.com" target="_blank" rel="noreferrer">Substack archive ↗</a></footer>
    </main>
  );
}

function BlogArticle({ post, query }: { post: BlogPost; query: string }) {
  return (
    <article className="blog-article">
      <Link href={withQuery("/blog", query)} className="blog-back">← All writing</Link>
      <header>
        <span className="blog-kicker">Essay / 001</span>
        <h1>{post.title}</h1>
        <div className="blog-article-meta"><time dateTime={post.publishedAt}>{dateLabel(post.publishedAt)}</time><span>·</span><span>Viraj Patel</span></div>
      </header>
      <div className="blog-article-rule" />
      <div className="blog-prose">
        {post.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
      <footer className="blog-article-footer">
        <span>Originally published on Substack.</span>
        <a href={post.sourceUrl} target="_blank" rel="noreferrer">Read at source ↗</a>
      </footer>
    </article>
  );
}

export function BlogApp({ post }: { post?: BlogPost }) {
  const query = useSearchParams().toString();
  return (
    <AppContent theme={blogTheme.content}>
      {post ? <BlogArticle post={post} query={query} /> : <BlogIndex query={query} />}
    </AppContent>
  );
}

function BlogIcon() {
  return <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true"><rect x="7" y="5" width="31" height="38" rx="2" fill="#fff9ed" stroke="#181818" strokeWidth="2.5"/><path d="M14 15h17M14 22h17M14 29h12" stroke="#ff5c35" strokeWidth="3" strokeLinecap="square"/><path d="M34 34h7" stroke="#181818" strokeWidth="2.5"/></svg>;
}

export const blogApp: AppDefinition = {
  id: "blog",
  title: "Blog",
  icon: <BlogIcon />,
  ui: blogTheme,
  width: 900,
  height: 680,
  minWidth: 460,
  minHeight: 430,
  content: <BlogApp />,
};
