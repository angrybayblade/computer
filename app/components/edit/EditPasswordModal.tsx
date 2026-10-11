"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { verifyEditCode } from "@/lib/metadata/client";

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
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setPortalRoot(getPortalRoot());
  }, []);

  useEffect(() => {
    if (!open) {
      setCode("");
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

    const result = await verifyEditCode(code);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
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
            <p className="edit-password-copy">Enter the current code from your authenticator app.</p>
            <label className="edit-password-label" htmlFor="edit-password-input">
              Authenticator code
            </label>
            <input
              id="edit-password-input"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              className="edit-field edit-password-input"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              autoFocus
              placeholder="000000"
            />
            {error ? <p className="edit-error edit-password-error">{error}</p> : null}
            <div className="edit-password-actions">
              <button type="button" className="edit-btn edit-btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="edit-btn edit-btn-primary" disabled={submitting || code.length !== 6}>
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
