"use client";

import { useRef, useState, type CSSProperties, type FormEvent } from "react";
import { AppContent } from "../AppContent";
import { type AppDefinition, type AppUiTheme } from "../types";
import { EditPasswordModal } from "@/app/components/edit/EditPasswordModal";

type Note = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

const notesTheme: AppUiTheme = {
  chrome: {
    accentColor: "#f4eedf",
    titleBarBackground: "#f4eedf",
    titleBarColor: "#302d29",
    titleBarBorderBottom: "1px solid #302d29",
    titleBarHeight: 40,
    titleFontSize: 15,
    titleFontWeight: 600,
    titleLetterSpacing: "0.03em",
    titleTextTransform: "none",
    titleBarFontFamily: 'var(--font-crimson-text), Georgia, serif',
    titleBarClassName: "notes-title-bar",
    windowClassName: "notes-window",
    controlsClassName: "notes-window-controls",
    windowBorder: "1px solid #302d29",
    windowBackground: "#f4eedf",
    windowShadow: "7px 8px 0 rgba(48, 45, 41, 0.28)",
    contentBackground: "#f4eedf",
    controls: {
      width: 36,
      borderLeft: "1px solid rgba(48, 45, 41, 0.45)",
      minimize: { background: "#f4eedf", color: "#302d29" },
      maximize: { background: "#f4eedf", color: "#302d29" },
      close: { background: "#c75a52", color: "#fffaf0" },
    },
  },
  content: {
    background: "#f4eedf",
    color: "#302d29",
    fontFamily: 'var(--font-crimson-text), Georgia, serif',
  },
};

const INITIAL_NOTES: readonly Note[] = [
  {
    id: "top-10-humans",
    title: "Top 10 Humans",
    body: "- Pitbull\n- Alka Yagnik\n- Bob Ross\n- Hugh Jackman",
    createdAt: "Demo note",
  },
];

const checklistPattern = /^- \[([ xX])\] (.+)$/;
const orderedListPattern = /^\d+\. (.+)$/;
const unorderedListPattern = /^[-*] (.+)$/;

function NoteBody({ body }: { body: string }) {
  const lines = body.split("\n");
  const blocks: React.ReactNode[] = [];

  for (let index = 0; index < lines.length;) {
    const checklist = lines[index].match(checklistPattern);
    if (checklist) {
      const items: Array<{ checked: boolean; text: string }> = [];
      while (index < lines.length) {
        const item = lines[index].match(checklistPattern);
        if (!item) break;
        items.push({ checked: item[1].toLowerCase() === "x", text: item[2] });
        index += 1;
      }
      blocks.push(
        <ul key={`checklist-${index}`} className="notes-checklist">
          {items.map((item, itemIndex) => (
            <li key={`${item.text}-${itemIndex}`}>
              <input type="checkbox" checked={item.checked} readOnly aria-label={item.text} />
              <span>{item.text}</span>
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    const ordered = lines[index].match(orderedListPattern);
    if (ordered) {
      const items: string[] = [];
      while (index < lines.length) {
        const item = lines[index].match(orderedListPattern);
        if (!item) break;
        items.push(item[1]);
        index += 1;
      }
      blocks.push(<ol key={`ordered-${index}`} className="notes-list-block">{items.map((item, itemIndex) => <li key={`${item}-${itemIndex}`}>{item}</li>)}</ol>);
      continue;
    }

    const unordered = lines[index].match(unorderedListPattern);
    if (unordered) {
      const items: string[] = [];
      while (index < lines.length) {
        const item = lines[index].match(unorderedListPattern);
        if (!item || lines[index].match(checklistPattern)) break;
        items.push(item[1]);
        index += 1;
      }
      blocks.push(<ul key={`unordered-${index}`} className="notes-list-block">{items.map((item, itemIndex) => <li key={`${item}-${itemIndex}`}>{item}</li>)}</ul>);
      continue;
    }

    const paragraph: string[] = [];
    while (index < lines.length && !lines[index].match(checklistPattern) && !lines[index].match(orderedListPattern) && !lines[index].match(unorderedListPattern)) {
      paragraph.push(lines[index]);
      index += 1;
    }
    if (paragraph.some(Boolean)) blocks.push(<p key={`paragraph-${index}`} className="notes-paper-body">{paragraph.join("\n")}</p>);
  }

  return <>{blocks}</>;
}

function noteId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `note-${Date.now()}`;
}

function NotesAppContent() {
  const [notes, setNotes] = useState<Note[]>(() => [...INITIAL_NOTES]);
  const [isEditing, setIsEditing] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const bodyInput = useRef<HTMLTextAreaElement>(null);

  function resetDraft() {
    setEditingId(null);
    setTitle("");
    setBody("");
  }

  function saveNote(event: FormEvent) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    if (!trimmedTitle && !trimmedBody) return;

    if (editingId) {
      setNotes((current) => current.map((note) => note.id === editingId
        ? { ...note, title: trimmedTitle || "Untitled note", body: trimmedBody }
        : note));
    } else {
      setNotes((current) => [
        {
          id: noteId(),
          title: trimmedTitle || "Untitled note",
          body: trimmedBody,
          createdAt: new Date().toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        },
        ...current,
      ]);
    }
    resetDraft();
  }

  function deleteNote(id: string) {
    setNotes((current) => current.filter((note) => note.id !== id));
    if (editingId === id) resetDraft();
  }

  function startEditing(note: Note) {
    setEditingId(note.id);
    setTitle(note.title);
    setBody(note.body);
  }

  function insertList(prefix: string) {
    const input = bodyInput.current;
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const selection = body.slice(start, end);
    const replacement = selection
      ? selection.split("\n").map((line) => `${prefix}${line}`).join("\n")
      : prefix;
    const nextBody = `${body.slice(0, start)}${replacement}${body.slice(end)}`;
    setBody(nextBody);
    requestAnimationFrame(() => {
      input.focus();
      const cursor = start + replacement.length;
      input.setSelectionRange(cursor, cursor);
    });
  }

  return (
    <div className="notes-app">
      <header className="notes-header">
        <div>
          <p className="notes-eyebrow">Personal archive · loose leaves</p>
          <h1 className="notes-title">Notes</h1>
        </div>
        {isEditing ? (
          <button type="button" onClick={() => setIsEditing(false)} className="notes-action">
            Put pencil down
          </button>
        ) : (
          <button type="button" onClick={() => setShowOtp(true)} className="notes-action">
            Pick up pencil
          </button>
        )}
      </header>

      {isEditing ? (
        <form onSubmit={saveNote} className="notes-editor">
          <label className="notes-label">
            Title
            <input value={title} onChange={(event) => setTitle(event.target.value)} className="notes-field" placeholder="New note" />
          </label>
          <label className="notes-label">
            Note
            <textarea ref={bodyInput} value={body} onChange={(event) => setBody(event.target.value)} className="notes-field" rows={4} placeholder="Write something down…" />
          </label>
          <div className="notes-editor-actions">
            <div className="notes-list-tools" aria-label="List tools">
              <button type="button" className="notes-tool" onClick={() => insertList("- [ ] ")}>Checklist</button>
              <button type="button" className="notes-tool" onClick={() => insertList("1. ")}>Ordered</button>
              <button type="button" className="notes-tool" onClick={() => insertList("- ")}>Bullets</button>
            </div>
            <div className="notes-save-actions">
              {editingId ? <button type="button" className="notes-tool" onClick={resetDraft}>Cancel</button> : null}
              <button type="submit" className="notes-action notes-add-action">
                {editingId ? "Save note" : "Add note"}
              </button>
            </div>
          </div>
        </form>
      ) : null}

      {notes.length === 0 ? (
        <p className="notes-empty">
          No notes published yet.
        </p>
      ) : (
        <div className="notes-list">
          {notes.map((note, index) => (
            <article key={note.id} className="notes-paper" style={{ "--note-tilt": `${index % 2 === 0 ? -0.6 : 0.45}deg` } as CSSProperties}>
              <div className="notes-paper-header">
                <h2 className="notes-paper-title">{note.title}</h2>
                {isEditing ? (
                  <div className="notes-paper-actions">
                    <button type="button" onClick={() => startEditing(note)} className="notes-tool">Edit</button>
                    <button type="button" onClick={() => deleteNote(note.id)} className="notes-delete">Delete</button>
                  </div>
                ) : null}
              </div>
              {note.body ? <NoteBody body={note.body} /> : null}
              <p className="notes-paper-date">{note.createdAt}</p>
            </article>
          ))}
        </div>
      )}

      <EditPasswordModal
        open={showOtp}
        onClose={() => setShowOtp(false)}
        onAuthenticated={() => setIsEditing(true)}
      />
    </div>
  );
}

export function NotesApp() {
  return <AppContent theme={notesTheme.content}><NotesAppContent /></AppContent>;
}

function NotesIcon() {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <path d="m12 7 25 4-4 30-25-4z" fill="#302d29" opacity="0.22" />
      <g transform="rotate(7 24 24)">
        <path d="M9 5h25l5 6v31H9z" fill="#fffdf7" stroke="#302d29" strokeWidth="1.5" />
        <path d="M34 5v7h5" fill="none" stroke="#302d29" strokeWidth="1.5" />
        <path d="M15 12v25" stroke="#c75a52" strokeWidth="1.25" opacity="0.78" />
        <path d="M18 18h15M18 24h14M18 30h12M18 36h9" stroke="#7e98ad" strokeWidth="1.45" strokeLinecap="round" opacity="0.8" />
        <path d="m12 4 10 0-2 6H10z" fill="#dfcb89" opacity="0.9" />
        <path d="m27 31 7-8 2 2-7 8-4 1z" fill="#d6a358" stroke="#302d29" strokeWidth="1" />
        <path d="m34 23 2 2 1-2z" fill="#302d29" />
      </g>
    </svg>
  );
}

export const notesApp: AppDefinition = {
  id: "notes",
  title: "Notes",
  icon: <NotesIcon />,
  ui: notesTheme,
  width: 760,
  height: 620,
  minWidth: 400,
  minHeight: 360,
  content: <NotesApp />,
};
