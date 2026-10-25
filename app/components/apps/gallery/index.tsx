"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AppContent } from "../AppContent";
import type { AppDefinition } from "../types";
import { galleryTheme } from "../themes/gallery";
import type { Photo } from "@/lib/photos/types";

export function GalleryApp({
  initialPhotos = [],
  initialSelectedPhotoId,
}: {
  initialPhotos?: Photo[];
  initialSelectedPhotoId?: string;
}) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(
    () =>
      initialPhotos.find((photo) => photo.id === initialSelectedPhotoId) ?? null,
  );
  const [copiedPhotoId, setCopiedPhotoId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedPhoto) return;
    const selectedPhotoId = selectedPhoto.id;

    function handleViewerKeyboard(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedPhoto(null);
        setCopiedPhotoId(null);
        return;
      }

      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

      const currentIndex = initialPhotos.findIndex(
        (photo) => photo.id === selectedPhotoId,
      );
      if (currentIndex === -1 || initialPhotos.length < 2) return;

      event.preventDefault();
      event.stopPropagation();
      const direction = event.key === "ArrowLeft" ? -1 : 1;
      const nextIndex =
        (currentIndex + direction + initialPhotos.length) % initialPhotos.length;
      setSelectedPhoto(initialPhotos[nextIndex]);
      setCopiedPhotoId(null);
    }
    window.addEventListener("keydown", handleViewerKeyboard);
    return () => window.removeEventListener("keydown", handleViewerKeyboard);
  }, [initialPhotos, selectedPhoto]);

  async function copyShareLink(photo: Photo) {
    const url = new URL("/gallery", window.location.origin);
    url.searchParams.set("photo", photo.id);

    try {
      await navigator.clipboard.writeText(url.toString());
    } catch {
      const input = document.createElement("textarea");
      input.value = url.toString();
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }

    setCopiedPhotoId(photo.id);
  }

  return (
    <AppContent theme={galleryTheme.content}>
      <main className="gallery-shell">
        <header className="gallery-header">
          <div className="gallery-header-copy">
            <span className="gallery-kicker">Places · people · passing light</span>
            <h1>Things I<br />stopped to see.</h1>
          </div>
          <p aria-label={`${initialPhotos.length} photographs`}>
            <strong>{initialPhotos.length.toString().padStart(2, "0")}</strong>
            <small>frames</small>
          </p>
          <div className="gallery-motifs" aria-hidden="true">
            <svg className="gallery-motif gallery-motif-nature" viewBox="0 0 170 130">
              <path d="M18 116C48 91 71 65 91 24" />
              <path d="M48 88C32 84 24 73 22 60c17 0 29 8 34 20" />
              <path d="M68 65C55 56 51 43 55 30c16 6 24 17 23 31" />
              <path d="M85 39c3-16 13-27 27-33 4 16-2 30-19 39" />
              <path d="M91 24c15 2 27 10 35 23-16 6-30 2-40-11" />
            </svg>
            <svg className="gallery-motif gallery-motif-souvenir" viewBox="0 0 150 112">
              <rect x="15" y="10" width="120" height="88" rx="2" />
              <circle cx="66" cy="54" r="23" />
              <path d="m66 34 6 14 15 6-15 6-6 14-6-14-15-6 15-6 6-14Z" />
              <path d="M103 24c16 8 25 20 28 36M108 18c18 8 30 20 35 36" />
            </svg>
            <svg className="gallery-motif gallery-motif-architecture" viewBox="0 0 180 170">
              <path d="M19 153h142M29 153V74C29 39 56 17 90 17s61 22 61 57v79" />
              <path d="M55 153V89c0-22 15-39 35-39s35 17 35 39v64" />
              <path d="M44 72h92M50 53h80M90 17V4" />
              <circle cx="90" cy="76" r="9" />
            </svg>
          </div>
        </header>

        {initialPhotos.length === 0 ? (
          <div className="gallery-empty">
            <span aria-hidden>＋</span>
            <p>The first frame is still waiting.</p>
          </div>
        ) : (
          <section className="gallery-grid" aria-label="Photo gallery">
            {initialPhotos.map((photo, index) => (
              <div className="gallery-photo" key={photo.id}>
                <button
                  type="button"
                  className="gallery-photo-open"
                  onClick={() => {
                    setSelectedPhoto(photo);
                    setCopiedPhotoId(null);
                  }}
                  aria-label={`Open photograph ${index + 1}`}
                >
                  <Image
                    src={photo.src}
                    alt=""
                    width={photo.width}
                    height={photo.height}
                    sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw"
                    unoptimized
                  />
                  <span className="gallery-photo-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </button>
                <div className="gallery-photo-actions">
                  <button
                    type="button"
                    onClick={() => copyShareLink(photo)}
                    aria-label={`Copy link to photograph ${index + 1}`}
                  >
                    {copiedPhotoId === photo.id ? "Copied" : "Share"}
                  </button>
                  <a
                    href={`/api/photos/${photo.id}?download=1`}
                    download={`viraj-photo-${photo.id}.webp`}
                    aria-label={`Download photograph ${index + 1}`}
                  >
                    Download
                  </a>
                </div>
              </div>
            ))}
          </section>
        )}

        {selectedPhoto ? (
          <div
            className="gallery-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Photograph preview. Use the left and right arrow keys to navigate."
            onClick={() => {
              setSelectedPhoto(null);
              setCopiedPhotoId(null);
            }}
          >
            <div
              className="gallery-lightbox-actions"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="gallery-lightbox-action"
                onClick={() => copyShareLink(selectedPhoto)}
              >
                {copiedPhotoId === selectedPhoto.id ? "Link copied" : "Copy link"}
              </button>
              <a
                className="gallery-lightbox-action"
                href={`/api/photos/${selectedPhoto.id}?download=1`}
                download={`viraj-photo-${selectedPhoto.id}.webp`}
              >
                Download
              </a>
              <button
                type="button"
                className="gallery-lightbox-action gallery-lightbox-close"
                onClick={() => {
                  setSelectedPhoto(null);
                  setCopiedPhotoId(null);
                }}
                aria-label="Close photograph"
              >
                Close ×
              </button>
            </div>
            <Image
              src={selectedPhoto.src}
              alt="Selected photograph"
              width={selectedPhoto.width}
              height={selectedPhoto.height}
              sizes="100vw"
              unoptimized
              onClick={(event) => event.stopPropagation()}
            />
          </div>
        ) : null}
      </main>
    </AppContent>
  );
}

function GalleryIcon() {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <path d="M8 15h8l3-5h10l3 5h8a3 3 0 0 1 3 3v19a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V18a3 3 0 0 1 3-3Z" fill="#f4e5d2" stroke="#082f60" strokeWidth="2" />
      <path d="M6 20h36" stroke="#c96d5b" strokeWidth="2" />
      <circle cx="24" cy="28" r="9" fill="#f4e8d8" stroke="#c96d5b" strokeWidth="2.5" />
      <circle cx="24" cy="28" r="4.5" fill="#082f60" />
      <circle cx="37" cy="18" r="2" fill="#d9a33a" />
    </svg>
  );
}

export const galleryApp: AppDefinition = {
  id: "gallery",
  title: "Gallery",
  icon: <GalleryIcon />,
  ui: galleryTheme,
  width: 960,
  height: 700,
  minWidth: 460,
  minHeight: 430,
  content: <GalleryApp />,
};
