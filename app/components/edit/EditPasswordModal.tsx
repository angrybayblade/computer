"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { verifyEditPassword } from "@/lib/metadata/client";

type EditPasswordModalProps = {
  open: boolean;
  onClose: () => void;
};

function getPortalRoot() {
  return document.getElementById("portal-root") ?? document.body;
}

export function EditPasswordModal({ open, onClose }: EditPasswordModalProps) {
  const router = useRouter();
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setPortalRoot(getPortalRoot());
  }, []);

  useEffect(() => {
    if (!open) {
      setPassword("");
      setError("");
      setSubmitting(false);
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const ok = await verifyEditPassword(password);
    setSubmitting(false);

    if (!ok) {
      setError("Incorrect password");
      return;
    }

    onClose();
    router.push("/edit");
  }

  if (!open || !portalRoot) return null;

  return createPortal(
    <div className="edit-password-overlay" onClick={onClose} role="presentation">
      <div className="edit-password-center" onClick={(event) => event.stopPropagation()}>
        <form
          className="edit-password-dialog"
          onSubmit={handleSubmit}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-password-title"
        >
          <div className="edit-password-header">
            <div className="edit-password-mark" aria-hidden>
              <span />
              <span />
              <span />
            </div>
            <div>
              <h2 id="edit-password-title" className="edit-password-title">
                Editor Access
              </h2>
              <p className="edit-password-subtitle">Restricted area</p>
            </div>
          </div>

          <div className="edit-password-body">
            <p className="edit-password-copy">Enter the edit password to open the metadata editor.</p>
            <label className="edit-password-label" htmlFor="edit-password-input">
              Password
            </label>
            <input
              id="edit-password-input"
              type="password"
              className="edit-field edit-password-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoFocus
              placeholder="••••••••"
            />
            {error ? <p className="edit-error edit-password-error">{error}</p> : null}
            <div className="edit-password-actions">
              <button type="button" className="edit-btn edit-btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="edit-btn edit-btn-primary" disabled={submitting || !password}>
                {submitting ? "Checking…" : "Unlock Editor"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    portalRoot
  );
}
