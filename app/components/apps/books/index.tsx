"use client";

import { useEffect, useState } from "react";
import { AppContent } from "../AppContent";
import { type AppDefinition } from "../types";
import { booksTheme } from "../themes";
import { type Book } from "@/lib/books/types";
import { fetchMetadata } from "@/lib/metadata/client";

function formatRating(value: number) {
  return String(value).padStart(2, "0");
}

function BookCard({
  book,
  index,
  onClick,
}: {
  book: Book;
  index: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="books-card"
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={onClick}
    >
      <div className="books-card-stage">
        <div className="books-card-cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={book.thumb} alt="" />
          <div className="books-rating-badge">
            {formatRating(book.rating)}/10
          </div>
        </div>
      </div>
      <h2 className="books-card-title">{book.title}</h2>
    </button>
  );
}

function BookDetail({ book, onBack }: { book: Book; onBack: () => void }) {
  return (
    <div className="books-detail">
      <div className="books-detail-header">
        <button type="button" className="books-detail-back" onClick={onBack}>
          Return
        </button>
      </div>

      <div className="books-detail-body">
        <div className="books-detail-side">
          <div className="books-detail-cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={book.thumb} alt="" />
          </div>

          <div className="books-detail-rating-block">
            <span className="books-detail-label">Rating</span>
            <div className="books-detail-rating-stamp">
              <span className="books-detail-rating-value">{formatRating(book.rating)}</span>
              <span className="books-detail-rating-suffix">/10</span>
            </div>
          </div>
        </div>

        <div className="books-detail-main">
          <span className="books-detail-tag">Selected volume</span>
          <h1 className="books-detail-title">{book.title}</h1>
          <p className="books-detail-author">{book.author}</p>

          <div className="books-detail-description">{book.description}</div>

          <div className="books-detail-footer">
            <span>Ref {book.id}</span>
            <span>Private collection</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BooksAppContent() {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    void fetchMetadata<Book>("books").then(setBooks);
  }, []);

  const selectedBook = books.find((book) => book.id === selectedId) ?? null;

  if (selectedBook) {
    return <BookDetail book={selectedBook} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="books-grid-wrap">
      <div className="books-texture books-texture-wood" aria-hidden />
      <div className="books-texture books-texture-gold" aria-hidden />
      <div className="books-vignette" aria-hidden />
      <div className="books-grid">
        {books.map((book, index) => (
          <BookCard
            key={book.id}
            book={book}
            index={index}
            onClick={() => setSelectedId(book.id)}
          />
        ))}
      </div>
    </div>
  );
}

export function BooksApp() {
  return (
    <AppContent theme={booksTheme.content}>
      <BooksAppContent />
    </AppContent>
  );
}

function BooksIcon() {
  return (
    <svg viewBox="0 0 36 36" aria-hidden>
      <rect x="3" y="3" width="30" height="30" fill="#0A0A0A" stroke="#C9A84C" strokeWidth="1" />
      <path
        d="M10 11h7v16H10V11zm9 0h7v16h-7V11z"
        fill="#1B3A2F"
        stroke="#C9A84C"
        strokeWidth="0.75"
      />
      <line x1="13.5" y1="14" x2="13.5" y2="24" stroke="#C9A84C" strokeWidth="0.75" opacity="0.6" />
      <line x1="22.5" y1="14" x2="22.5" y2="24" stroke="#C9A84C" strokeWidth="0.75" opacity="0.6" />
    </svg>
  );
}

export const booksApp: AppDefinition = {
  id: "books",
  title: "Books",
  icon: <BooksIcon />,
  ui: booksTheme,
  width: 920,
  height: 680,
  minWidth: 520,
  minHeight: 440,
  content: <BooksApp />,
};
