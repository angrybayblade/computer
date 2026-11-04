"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Photo } from "@/lib/photos/types";

const MAX_FILES_PER_SELECTION = 20;

async function responseError(response: Response) {
  const body = (await response.json().catch(() => ({}))) as {
    error?: string;
    failures?: Array<{ name: string; error?: string }>;
  };
  const failedFiles = body.failures
    ?.map((failure) =>
      failure.error ? `${failure.name}: ${failure.error}` : failure.name,
    )
    .join(", ");
  return [body.error || `Request failed (${response.status})`, failedFiles]
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
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

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
    const selectedFiles = files;
    const failedFiles: File[] = [];
    const failureMessages: string[] = [];
    const uploadedPhotos: Photo[] = [];
    let duplicateCount = 0;

    try {
      for (const [index, file] of selectedFiles.entries()) {
        setUploadProgress({ current: index + 1, total: selectedFiles.length });
        setFeedback(`Uploading ${index + 1} of ${selectedFiles.length}: ${file.name}`);

        const formData = new FormData();
        formData.append("photos", file);

        try {
          const response = await fetch("/api/photos", {
            method: "POST",
            body: formData,
          });
          if (!response.ok) {
            const message = await responseError(response);
            failedFiles.push(file);
            failureMessages.push(`${file.name}: ${message}`);

            if (response.status === 401) {
              failedFiles.push(...selectedFiles.slice(index + 1));
              break;
            }
            continue;
          }

          const result = (await response.json()) as {
            photos: Photo[];
            duplicates?: Photo[];
          };
          uploadedPhotos.push(...result.photos);
          duplicateCount += result.duplicates?.length ?? 0;
        } catch (err) {
          failedFiles.push(file);
          failureMessages.push(
            `${file.name}: ${err instanceof Error ? err.message : "Upload failed"}`,
          );
        }
      }

      setFiles(failedFiles);
      if (inputRef.current) inputRef.current.value = "";
      if (uploadedPhotos.length > 0) {
        setPhotos((current) => [...[...uploadedPhotos].reverse(), ...current]);
      }

      setError(failureMessages.join(" · "));
      const summary = [];
      if (uploadedPhotos.length > 0) {
        summary.push(
          `${uploadedPhotos.length} ${uploadedPhotos.length === 1 ? "photo" : "photos"} uploaded`,
        );
      }
      if (duplicateCount > 0) {
        summary.push(
          `${duplicateCount} duplicate ${duplicateCount === 1 ? "was" : "were"} already published`,
        );
      }
      if (failedFiles.length > 0) {
        summary.push(`${failedFiles.length} ready to retry`);
      }
      setFeedback(summary.join(" · "));
    } finally {
      setUploadProgress(null);
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
                {uploadProgress
                  ? `Uploading ${uploadProgress.current}/${uploadProgress.total}`
                  : `Upload ${files.length || ""}`.trim()}
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
                  const selectedFiles = Array.from(event.target.files ?? []);
                  setFiles(selectedFiles.slice(0, MAX_FILES_PER_SELECTION));
                  setError(
                    selectedFiles.length > MAX_FILES_PER_SELECTION
                      ? `Choose up to ${MAX_FILES_PER_SELECTION} photos at a time`
                      : "",
                  );
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
