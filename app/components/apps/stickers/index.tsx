"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AppContent } from "../AppContent";
import type { AppDefinition } from "../types";
import { stickersTheme } from "../themes/stickers";
import type { Sticker } from "@/lib/stickers/types";
import styles from "./stickers.module.css";

type Feedback = {
  id: string;
  action: "image" | "link" | "error";
};

async function pngBlobForSticker(src: string) {
  const response = await fetch(src);
  if (!response.ok) throw new Error("Sticker could not be loaded");
  const source = await response.blob();
  const bitmap = await createImageBitmap(source);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("Image copying is unavailable");
  }
  context.drawImage(bitmap, 0, 0);
  bitmap.close();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Image copying failed"))),
      "image/png",
    );
  });
}

async function writeClipboardText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const input = document.createElement("textarea");
    input.value = value;
    input.style.cssText = "position:fixed;opacity:0;pointer-events:none";
    document.body.appendChild(input);
    input.select();
    const copied = document.execCommand("copy");
    input.remove();
    if (!copied) throw new Error("Link copying failed");
  }
}

export function StickersApp({
  initialStickers = [],
  initialSelectedStickerId,
}: {
  initialStickers?: Sticker[];
  initialSelectedStickerId?: string;
}) {
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(
    () =>
      initialStickers.find((sticker) => sticker.id === initialSelectedStickerId) ??
      null,
  );
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    if (!selectedSticker) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedSticker(null);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedSticker]);

  async function copyLink(sticker: Sticker) {
    const url = new URL("/stickers", window.location.origin);
    url.searchParams.set("sticker", sticker.id);
    try {
      await writeClipboardText(url.toString());
      setFeedback({ id: sticker.id, action: "link" });
    } catch {
      setFeedback({ id: sticker.id, action: "error" });
    }
  }

  async function copyImage(sticker: Sticker) {
    if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
      setFeedback({ id: sticker.id, action: "error" });
      return;
    }

    try {
      const png = pngBlobForSticker(sticker.src);
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": png }),
      ]);
      setFeedback({ id: sticker.id, action: "image" });
    } catch {
      setFeedback({ id: sticker.id, action: "error" });
    }
  }

  function actionLabel(sticker: Sticker, action: Feedback["action"]) {
    if (feedback?.id !== sticker.id || feedback.action !== action) return null;
    if (action === "image") return "Image copied";
    if (action === "link") return "Link copied";
    return "Copy failed";
  }

  return (
    <AppContent theme={stickersTheme.content}>
      <main className={styles.shell}>
        <header className={styles.header}>
          <div>
            <span className={styles.kicker}>Peel · paste · repeat</span>
            <h1>Sticker<br />drawer</h1>
          </div>
          <p>
            Images kept close for conversations, posts, and anywhere words need
            backup.
          </p>
          <span className={styles.count} aria-label={`${initialStickers.length} stickers`}>
            {initialStickers.length.toString().padStart(2, "0")}
          </span>
        </header>

        {initialStickers.length === 0 ? (
          <section className={styles.empty}>
            <span aria-hidden>✦</span>
            <h2>The drawer is empty.</h2>
            <p>Add the first reusable image from edit mode.</p>
          </section>
        ) : (
          <section className={styles.grid} aria-label="Sticker collection">
            {initialStickers.map((sticker, index) => (
              <article className={styles.card} key={sticker.id}>
                <button
                  type="button"
                  className={styles.preview}
                  onClick={() => setSelectedSticker(sticker)}
                  aria-label={`Preview sticker ${index + 1}`}
                >
                  <span className={styles.checkerboard}>
                    <Image
                      src={sticker.src}
                      alt=""
                      width={sticker.width}
                      height={sticker.height}
                      sizes="(max-width: 640px) 50vw, (max-width: 1000px) 33vw, 240px"
                      unoptimized
                    />
                  </span>
                  <span className={styles.number}>
                    #{String(index + 1).padStart(2, "0")}
                  </span>
                </button>
                <div className={styles.actions}>
                  <button type="button" onClick={() => void copyImage(sticker)}>
                    Copy image
                  </button>
                  <button type="button" onClick={() => void copyLink(sticker)}>
                    Copy link
                  </button>
                  <a
                    href={`/api/stickers/${sticker.id}?download=1`}
                    download={`viraj-sticker-${sticker.id}.webp`}
                  >
                    Download
                  </a>
                </div>
                <p className={styles.feedback} aria-live="polite">
                  {actionLabel(sticker, feedback?.action ?? "link")}
                </p>
              </article>
            ))}
          </section>
        )}

        {selectedSticker ? (
          <div
            className={styles.viewer}
            role="dialog"
            aria-modal="true"
            aria-label="Sticker preview"
            onClick={() => setSelectedSticker(null)}
          >
            <div
              className={styles.viewerActions}
              onClick={(event) => event.stopPropagation()}
            >
              <button type="button" onClick={() => void copyImage(selectedSticker)}>
                {feedback?.id === selectedSticker.id && feedback.action === "error"
                  ? "Copy failed"
                  : actionLabel(selectedSticker, "image") ?? "Copy image"}
              </button>
              <button type="button" onClick={() => void copyLink(selectedSticker)}>
                {feedback?.id === selectedSticker.id && feedback.action === "error"
                  ? "Copy failed"
                  : actionLabel(selectedSticker, "link") ?? "Copy link"}
              </button>
              <a
                href={`/api/stickers/${selectedSticker.id}?download=1`}
                download={`viraj-sticker-${selectedSticker.id}.webp`}
              >
                Download
              </a>
              <button type="button" onClick={() => setSelectedSticker(null)}>
                Close ×
              </button>
            </div>
            <div className={styles.viewerImage} onClick={(event) => event.stopPropagation()}>
              <Image
                src={selectedSticker.src}
                alt="Selected sticker"
                width={selectedSticker.width}
                height={selectedSticker.height}
                sizes="90vw"
                unoptimized
              />
            </div>
          </div>
        ) : null}
      </main>
    </AppContent>
  );
}

function StickersIcon() {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <rect x="7" y="7" width="36" height="36" rx="3" fill="#25221F" />
      <rect x="4" y="4" width="36" height="36" rx="3" fill="#F7EDDA" stroke="#25221F" strokeWidth="2" />
      <path d="M8 8h28v28H8z" fill="#8AA7FF" />
      <path d="m13 29 6-17 5 10 5-6 5 13Z" fill="#FFCF4A" stroke="#25221F" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M28 36h8v-8a8 8 0 0 1-8 8Z" fill="#67C9BF" stroke="#25221F" strokeWidth="1.5" />
      <circle cx="13" cy="13" r="3" fill="#FF6B57" stroke="#25221F" strokeWidth="1.5" />
    </svg>
  );
}

export const stickersApp: AppDefinition = {
  id: "stickers",
  title: "Stickers",
  icon: <StickersIcon />,
  ui: stickersTheme,
  width: 900,
  height: 680,
  minWidth: 480,
  minHeight: 420,
  content: <StickersApp />,
};
