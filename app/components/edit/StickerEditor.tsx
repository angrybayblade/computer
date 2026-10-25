"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Sticker } from "@/lib/stickers/types";

async function responseError(response: Response) {
  const body = (await response.json().catch(() => ({}))) as {
    error?: string;
    failures?: Array<{ name: string }>;
  };
  const failedNames = body.failures?.map((failure) => failure.name).join(", ");
  return [body.error || `Request failed (${response.status})`, failedNames]
    .filter(Boolean)
    .join(": ");
}

function fileSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function fetchStickers() {
  const response = await fetch("/api/stickers", { cache: "no-store" });
  if (!response.ok) throw new Error(await responseError(response));
  return (await response.json()) as Sticker[];
}

export function StickerEditor() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const loadStickers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setStickers(await fetchStickers());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stickers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchStickers()
      .then((nextStickers) => {
        if (!cancelled) setStickers(nextStickers);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load stickers");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function uploadStickers(event: React.FormEvent) {
    event.preventDefault();
    if (files.length === 0) return;

    setUploading(true);
    setError("");
    setFeedback("");
    const formData = new FormData();
    for (const file of files) formData.append("stickers", file);

    try {
      const response = await fetch("/api/stickers", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error(await responseError(response));
      const result = (await response.json()) as {
        stickers: Sticker[];
        failures?: Array<{ name: string }>;
      };
      setFiles([]);
      if (inputRef.current) inputRef.current.value = "";
      await loadStickers();
      setFeedback(
        result.failures?.length
          ? `${result.stickers.length} uploaded. Could not process: ${result.failures.map((failure) => failure.name).join(", ")}`
          : `${result.stickers.length} ${result.stickers.length === 1 ? "sticker" : "stickers"} uploaded`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function removeSticker(sticker: Sticker) {
    if (!window.confirm("Delete this sticker permanently?")) return;
    setError("");

    try {
      const response = await fetch(`/api/stickers/${sticker.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(await responseError(response));
      setStickers((current) =>
        current.filter((entry) => entry.id !== sticker.id),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="edit-shell sticker-editor-shell">
      <header className="edit-header">
        <div className="edit-header-left">
          <div className="edit-auth-mark" aria-hidden><span /><span /><span /></div>
          <h1 className="edit-page-title">Sticker Editor</h1>
        </div>
        <Link href="/" className="edit-btn edit-btn-secondary">Back to Desktop</Link>
      </header>

      <div className="edit-layout">
        <aside className="edit-sidebar">
          <Link href="/edit" className="edit-nav-item">Metadata</Link>
          <Link href="/edit/photos" className="edit-nav-item">Photos</Link>
          <span className="edit-nav-item edit-nav-item-active">Stickers</span>
        </aside>

        <main className="edit-main photo-editor-main">
          <form className="edit-panel" onSubmit={(event) => void uploadStickers(event)}>
            <div className="edit-panel-header photo-upload-header">
              <div>
                <h2>Upload stickers</h2>
                <p className="edit-muted">Choose up to 20 images. They are resized when needed, stored as lossless WebP, and stripped of metadata.</p>
              </div>
              <button className="edit-btn edit-btn-primary" type="submit" disabled={uploading || files.length === 0}>
                {uploading ? "Processing…" : `Upload ${files.length || ""}`.trim()}
              </button>
            </div>

            <label className="photo-upload-dropzone">
              <span className="photo-upload-symbol" aria-hidden>✦</span>
              <strong>{files.length > 0 ? "Change selection" : "Select sticker images"}</strong>
              <small>PNG · JPEG · WebP · AVIF · HEIC · TIFF</small>
              <span className="photo-upload-choose">Choose files</span>
              <input
                ref={inputRef}
                className="photo-upload-input"
                type="file"
                accept="image/avif,image/heic,image/heif,image/jpeg,image/png,image/tiff,image/webp"
                multiple
                disabled={uploading}
                onChange={(event) => {
                  setFiles(Array.from(event.target.files ?? []));
                  setError("");
                  setFeedback("");
                }}
              />
            </label>

            {files.length > 0 ? (
              <ul className="photo-upload-selection">
                {files.map((file, index) => (
                  <li key={`${file.name}-${file.lastModified}-${index}`}>
                    <span><strong>{file.name}</strong><small>{fileSize(file.size)}</small></span>
                    <button
                      type="button"
                      onClick={() => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))}
                      aria-label={`Remove ${file.name}`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="photo-upload-status" aria-live="polite">
              {error ? <p className="edit-error">{error}</p> : null}
              {feedback ? <p className="photo-upload-success">{feedback}</p> : null}
            </div>
          </form>

          <section className="edit-panel">
            <div className="edit-panel-header">
              <h2>Published stickers</h2>
              <span className="edit-muted">{stickers.length} total</span>
            </div>
            {loading ? (
              <p className="edit-muted">Loading…</p>
            ) : stickers.length === 0 ? (
              <p className="edit-muted">No stickers uploaded yet.</p>
            ) : (
              <div className="photo-editor-grid">
                {stickers.map((sticker) => (
                  <article key={sticker.id} className="photo-editor-card sticker-editor-card">
                    <div className="sticker-editor-preview">
                      <Image src={sticker.src} alt="" width={sticker.width} height={sticker.height} unoptimized />
                    </div>
                    <button type="button" className="edit-link-btn edit-link-btn-danger" onClick={() => void removeSticker(sticker)}>
                      Delete
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
