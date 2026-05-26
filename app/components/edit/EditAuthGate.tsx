"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifyEditPassword } from "@/lib/metadata/client";

export function EditAuthGate() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
          type="password"
          className="edit-field"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoFocus
          placeholder="Password"
        />
        {error ? <p className="edit-error">{error}</p> : null}
        <div className="edit-modal-actions">
          <button type="button" className="edit-btn edit-btn-secondary" onClick={() => router.push("/")}>
            Back
          </button>
          <button type="submit" className="edit-btn edit-btn-primary" disabled={submitting}>
            {submitting ? "Checking…" : "Unlock"}
          </button>
        </div>
      </form>
    </div>
  );
}
