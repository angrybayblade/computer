"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifyEditCode } from "@/lib/metadata/client";

export function EditAuthGate() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

    router.refresh();
  }

  return (
    <div className="edit-shell edit-auth">
      <form className="edit-auth-card" onSubmit={handleSubmit}>
        <div className="edit-auth-mark" aria-hidden>
          <span />
          <span />
          <span />
        </div>
        <h1 className="edit-page-title">Metadata Editor</h1>
        <p className="edit-page-subtitle">Authentication required</p>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          className="edit-field"
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
          autoFocus
          placeholder="6-digit code"
        />
        {error ? <p className="edit-error">{error}</p> : null}
        <div className="edit-modal-actions">
          <button type="button" className="edit-btn edit-btn-secondary" onClick={() => router.push("/")}>
            Back
          </button>
          <button type="submit" className="edit-btn edit-btn-primary" disabled={submitting || code.length !== 6}>
            {submitting ? "Checking…" : "Unlock"}
          </button>
        </div>
      </form>
    </div>
  );
}
