"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  createMetadataRow,
  deleteMetadataRow,
  fetchEditorRows,
  updateMetadataRow,
} from "@/lib/metadata/client";
import {
  RESOURCE_CONFIGS,
  createResourceId,
  type FieldConfig,
  type ResourceConfig,
  type ResourceSlug,
} from "@/lib/metadata/resources";

function emptyForm(config: ResourceConfig) {
  return Object.fromEntries(config.fields.map((field) => [field.key, ""]));
}

function rowToForm(config: ResourceConfig, row: Record<string, unknown>) {
  const form: Record<string, string> = {};
  for (const field of config.fields) {
    const value = row[field.key];
    form[field.key] = value == null ? "" : String(value);
  }
  return form;
}

function FieldInput({
  field,
  value,
  onChange,
  disabled,
}: {
  field: FieldConfig;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const common = {
    className: "edit-field",
    value,
    disabled,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(event.target.value),
    placeholder: field.placeholder,
    required: field.required,
  };

  if (field.type === "textarea") {
    return <textarea {...common} rows={4} />;
  }

  return <input {...common} type={field.type === "number" ? "number" : "text"} step={field.type === "number" ? "0.1" : undefined} />;
}

export function MetadataEditor() {
  const [activeSlug, setActiveSlug] = useState<ResourceSlug>("movies");
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const config = useMemo(
    () => RESOURCE_CONFIGS.find((entry) => entry.slug === activeSlug)!,
    [activeSlug]
  );

  const loadRows = useCallback(async (slug: ResourceSlug) => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchEditorRows(slug);
      setRows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load rows");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const current = RESOURCE_CONFIGS.find((entry) => entry.slug === activeSlug)!;
    setSelectedId(null);
    setForm(emptyForm(current));
    void loadRows(activeSlug);
  }, [activeSlug, loadRows]);

  function startCreate() {
    setSelectedId(null);
    setForm(emptyForm(config));
    setError("");
  }

  function startEdit(row: Record<string, unknown>) {
    setSelectedId(String(row.id));
    setForm(rowToForm(config, row));
    setError("");
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload: Record<string, unknown> = { ...form };
    if (!payload.id) {
      const label = String(form.name || form.title || form.song || activeSlug);
      payload.id = createResourceId(label, activeSlug);
    }

    try {
      if (selectedId) {
        await updateMetadataRow(activeSlug, selectedId, payload);
      } else {
        await createMetadataRow(activeSlug, payload);
      }
      await loadRows(activeSlug);
      startCreate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this entry?")) return;

    setSaving(true);
    setError("");
    try {
      await deleteMetadataRow(activeSlug, id);
      await loadRows(activeSlug);
      if (selectedId === id) startCreate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="edit-shell">
      <header className="edit-header">
        <div className="edit-header-left">
          <div className="edit-auth-mark" aria-hidden>
            <span />
            <span />
            <span />
          </div>
          <div>
            <h1 className="edit-page-title">Metadata Editor</h1>
          </div>
        </div>
        <Link href="/" className="edit-btn edit-btn-secondary">
          Back to Desktop
        </Link>
      </header>

      <div className="edit-layout">
        <aside className="edit-sidebar">
          {RESOURCE_CONFIGS.map((entry) => (
            <button
              key={entry.slug}
              type="button"
              className={entry.slug === activeSlug ? "edit-nav-item edit-nav-item-active" : "edit-nav-item"}
              onClick={() => setActiveSlug(entry.slug)}
            >
              {entry.label}
            </button>
          ))}
        </aside>

        <main className="edit-main">
          <div className="edit-panel">
            <div className="edit-panel-header">
              <h2>{config.label}</h2>
              <button type="button" className="edit-btn edit-btn-primary" onClick={startCreate}>
                New Entry
              </button>
            </div>

            {error ? <p className="edit-error">{error}</p> : null}

            <div className="edit-table-wrap">
              {loading ? (
                <p className="edit-muted">Loading…</p>
              ) : rows.length === 0 ? (
                <p className="edit-muted">No entries yet.</p>
              ) : (
                <table className="edit-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      {config.listColumns.map((column) => (
                        <th key={column.key}>{column.label}</th>
                      ))}
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={String(row.id)}>
                        <td>{String(row.id)}</td>
                        {config.listColumns.map((column) => (
                          <td key={column.key}>{String(row[column.key] ?? "")}</td>
                        ))}
                        <td className="edit-table-actions">
                          <button type="button" className="edit-link-btn" onClick={() => startEdit(row)}>
                            Edit
                          </button>
                          <button
                            type="button"
                            className="edit-link-btn edit-link-btn-danger"
                            onClick={() => void handleDelete(String(row.id))}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <form className="edit-panel" onSubmit={(event) => void handleSave(event)}>
            <div className="edit-panel-header">
              <h2>{selectedId ? "Edit Entry" : "Create Entry"}</h2>
            </div>

            <div className="edit-form-grid">
              {config.fields.map((field) => (
                <label key={field.key} className="edit-label">
                  <span>{field.label}</span>
                  <FieldInput
                    field={field}
                    value={form[field.key] ?? ""}
                    disabled={Boolean(selectedId) && field.key === "id"}
                    onChange={(value) => setForm((current) => ({ ...current, [field.key]: value }))}
                  />
                </label>
              ))}
            </div>

            <div className="edit-modal-actions">
              <button type="submit" className="edit-btn edit-btn-primary" disabled={saving}>
                {saving ? "Saving…" : selectedId ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
