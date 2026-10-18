import Link from "next/link";

export default function Home() {
  return (
    <noscript>
      <main>
        <h1>Viraj Patel — Software Engineer</h1>
        <p>
          Viraj Patel, also known online as angrybayblade, is a software engineer in Bengaluru,
          India. He builds developer platforms, SDKs, orchestration systems, and open-source
          infrastructure.
        </p>
        <nav aria-label="Portfolio sections">
          <Link href="/about">About</Link>{" "}
          <Link href="/resume">Resume</Link>{" "}
          <Link href="/movies">Movies</Link>{" "}
          <Link href="/music">Music</Link>{" "}
          <Link href="/comics">Comics</Link>{" "}
          <Link href="/anime">Anime</Link>{" "}
          <Link href="/books">Books</Link>{" "}
          <Link href="/blog">Blog</Link>{" "}
          <Link href="/vines">Vines</Link>
        </nav>
      </main>
    </noscript>
  );
}
