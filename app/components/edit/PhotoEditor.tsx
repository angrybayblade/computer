"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Photo } from "@/lib/photos/types";

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

async function fetchPhotos() {
  const response = await fetch("/api/photos", { cache: "no-store" });
  if (!response.ok) throw new Error(await responseError(response));
  return (await response.json()) as Photo[];
}

export function PhotoEditor() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setPhotos(await fetchPhotos());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load photos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchPhotos()
      .then((nextPhotos) => {
        if (!cancelled) setPhotos(nextPhotos);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load photos");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function uploadPhotos(event: React.FormEvent) {
    event.preventDefault();
    if (files.length === 0) return;

    setUploading(true);
    setError("");
    setFeedback("");
    const formData = new FormData();
    for (const file of files) formData.append("photos", file);

    try {
      const response = await fetch("/api/photos", { method: "POST", body: formData });
      if (!response.ok) throw new Error(await responseError(response));
      const result = (await response.json()) as {
        photos: Photo[];
        failures?: Array<{ name: string }>;
      };
      setFiles([]);
      if (inputRef.current) inputRef.current.value = "";
      await loadPhotos();
      setFeedback(
        result.failures?.length
          ? `${result.photos.length} uploaded. Could not process: ${result.failures.map((failure) => failure.name).join(", ")}`
          : `${result.photos.length} ${result.photos.length === 1 ? "photo" : "photos"} uploaded`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function removeSelectedFile(index: number) {
    setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
    setError("");
    setFeedback("");
  }

  async function removePhoto(photo: Photo) {
    if (!window.confirm("Delete this photo permanently?")) return;
    setError("");

    try {
      const response = await fetch(`/api/photos/${photo.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await responseError(response));
      setPhotos((current) => current.filter((entry) => entry.id !== photo.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="edit-shell">
      <header className="edit-header">
        <div className="edit-header-left">
          <div className="edit-auth-mark" aria-hidden><span /><span /><span /></div>
          <h1 className="edit-page-title">Photo Editor</h1>
        </div>
        <Link href="/" className="edit-btn edit-btn-secondary">Back to Desktop</Link>
      </header>

      <div className="edit-layout">
        <aside className="edit-sidebar">
          <Link href="/edit" className="edit-nav-item">Metadata</Link>
          <span className="edit-nav-item edit-nav-item-active">Photos</span>
          <Link href="/edit/stickers" className="edit-nav-item">Stickers</Link>
        </aside>

        <main className="edit-main photo-editor-main">
          <form className="edit-panel" onSubmit={(event) => void uploadPhotos(event)}>
            <div className="edit-panel-header photo-upload-header">
              <div>
                <h2>Upload photos</h2>
                <p className="edit-muted">Choose up to 20 originals. Location and camera metadata are removed before publishing.</p>
              </div>
              <button className="edit-btn edit-btn-primary" type="submit" disabled={uploading || files.length === 0}>
                {uploading ? "Sanitizing…" : `Upload ${files.length || ""}`.trim()}
              </button>
            </div>

            <label className="photo-upload-dropzone">
              <span className="photo-upload-symbol" aria-hidden>＋</span>
              <strong>{files.length > 0 ? "Change selection" : "Select photographs"}</strong>
              <small>JPEG · PNG · WebP · AVIF · HEIC · TIFF</small>
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
                    <span>
                      <strong>{file.name}</strong>
                      <small>{fileSize(file.size)}</small>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSelectedFile(index)}
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
              <h2>Published photos</h2>
              <span className="edit-muted">{photos.length} total</span>
            </div>
            {loading ? (
              <p className="edit-muted">Loading…</p>
            ) : photos.length === 0 ? (
              <p className="edit-muted">No photos uploaded yet.</p>
            ) : (
              <div className="photo-editor-grid">
                {photos.map((photo) => (
                  <article key={photo.id} className="photo-editor-card">
                    <Image src={photo.src} alt="" width={photo.width} height={photo.height} unoptimized />
                    <button type="button" className="edit-link-btn edit-link-btn-danger" onClick={() => void removePhoto(photo)}>
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
