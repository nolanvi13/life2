"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import { useApp } from "@/components/providers/AppProvider";
import { useNotes } from "@/hooks/useNotes";
import type { Note } from "@/lib/notes";
import {
  IconBold, IconItalic, IconUnderline, IconList, IconListCheck,
  IconH1, IconH2, IconStrikethrough,
} from "@tabler/icons-react";

type SaveStatus = "idle" | "saving" | "saved" | "error";

const MOIS = ["jan","fév","mar","avr","mai","juin","juil","aoû","sep","oct","nov","déc"];

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffH = (now.getTime() - d.getTime()) / 3600000;
  if (diffH < 1) return "À l'instant";
  if (diffH < 24) return `Il y a ${Math.floor(diffH)}h`;
  if (diffH < 48) return "Hier";
  return `${d.getDate()} ${MOIS[d.getMonth()]}`;
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function notePreview(note: Note): string {
  if (!note.content.trim()) return "Pas de contenu";
  return stripHtml(note.content).slice(0, 60) || "Pas de contenu";
}

function displayTitle(note: Note): string {
  return note.title.trim() || "Sans titre";
}

export function NotesPage() {
  const { coupleId, myOwner, nolanName, lylouName } = useApp();
  const { notes, loading, createNote, updateNote, deleteNote } = useNotes(coupleId, myOwner);
  const [openNote, setOpenNote] = useState<Note | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const nameOf = (owner: string) => owner === "nolan" ? nolanName : lylouName;

  async function handleNew() {
    const note = await createNote();
    if (note) setOpenNote(note);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)", fontSize: "14px" }}>Chargement…</p>
      </div>
    );
  }

  if (openNote) {
    return (
      <NoteEditor
        note={openNote}
        onUpdate={(fields) => updateNote(openNote.id, fields)}
        onClose={() => setOpenNote(null)}
        onDelete={async () => {
          await deleteNote(openNote.id);
          setOpenNote(null);
        }}
        authorName={nameOf(openNote.created_by)}
        confirmDelete={confirmDelete}
        setConfirmDelete={setConfirmDelete}
      />
    );
  }

  return (
    <div className="max-w-lg mx-auto px-6 pt-9 pb-32 md:pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "34px", fontWeight: 500, color: "var(--color-ink)", letterSpacing: "-0.8px" }}>
          Notes
        </h1>
        <button
          onClick={handleNew}
          style={{
            background: "var(--color-forest)", color: "#fff", border: "none",
            borderRadius: "10px", padding: "9px 16px", fontFamily: "var(--font-body)",
            fontSize: "13px", fontWeight: 500, cursor: "pointer",
            display: "flex", alignItems: "center", gap: "6px",
          }}
        >
          + Nouvelle note
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-20">
          <p style={{ fontSize: "40px", marginBottom: "12px" }}>📓</p>
          <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
            Aucune note pour l'instant
          </p>
          <button
            onClick={handleNew}
            style={{
              marginTop: "16px", padding: "9px 18px", borderRadius: "10px",
              fontSize: "13px", fontWeight: 500, background: "var(--color-forest)",
              color: "#fff", border: "none", cursor: "pointer", fontFamily: "var(--font-body)",
            }}
          >
            Créer la première note
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <button
              key={note.id}
              onClick={() => { setConfirmDelete(false); setOpenNote(note); }}
              style={{
                width: "100%", textAlign: "left", padding: "16px",
                borderRadius: "14px", border: "0.5px solid var(--color-border)",
                background: "var(--surface-2)", cursor: "pointer",
                transition: "transform 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
            >
              <div className="flex items-start justify-between gap-3">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 500, color: "var(--color-ink)", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {displayTitle(note)}
                  </p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--color-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {notePreview(note)}
                  </p>
                </div>
                <div style={{ flexShrink: 0, textAlign: "right" }}>
                  <p style={{ fontSize: "11px", color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
                    {formatDate(note.updated_at)}
                  </p>
                  <p style={{ fontSize: "11px", color: "var(--color-forest)", fontFamily: "var(--font-body)", marginTop: "3px", fontWeight: 500 }}>
                    {nameOf(note.created_by)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Bouton de formatage ─── */
function FmtBtn({
  onClick, active, title, children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      style={{
        width: "34px", height: "34px", borderRadius: "8px", border: "none",
        background: active ? "var(--color-forest)" : "transparent",
        color: active ? "#fff" : "var(--color-ink)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", flexShrink: 0, transition: "background 0.15s",
      }}
    >
      {children}
    </button>
  );
}

/* ─── Éditeur ─── */
function NoteEditor({
  note, onUpdate, onClose, onDelete, authorName, confirmDelete, setConfirmDelete,
}: {
  note: Note;
  onUpdate: (fields: Partial<Pick<Note, "title" | "content">>) => Promise<void>;
  onClose: () => void;
  onDelete: () => Promise<void>;
  authorName: string;
  confirmDelete: boolean;
  setConfirmDelete: (v: boolean) => void;
}) {
  const [title, setTitle] = useState(note.title);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs pour la closure unmount
  const latestTitle = useRef(note.title);
  const latestContent = useRef(note.content);
  const onUpdateRef = useRef(onUpdate);
  useEffect(() => { latestTitle.current = title; }, [title]);
  useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);

  const scheduleSave = useCallback((t: string, html: string) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus("saving");
    saveTimer.current = setTimeout(async () => {
      saveTimer.current = null;
      try {
        await onUpdateRef.current({ title: t, content: html });
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch {
        setSaveStatus("error");
      }
    }, 700);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2] } }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: false }),
      Placeholder.configure({ placeholder: "Commence à écrire…" }),
    ],
    content: note.content || "",
    onUpdate({ editor }) {
      const html = editor.getHTML();
      latestContent.current = html;
      scheduleSave(latestTitle.current, html);
    },
    editorProps: {
      attributes: { class: "tiptap-editor" },
    },
  });

  // Sauvegarde à la fermeture
  useEffect(() => {
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        onUpdateRef.current({ title: latestTitle.current, content: latestContent.current });
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleTitle(v: string) {
    setTitle(v);
    scheduleSave(v, latestContent.current);
  }

  const statusText =
    saveStatus === "saving" ? "Sauvegarde…" :
    saveStatus === "saved"  ? "✓ Sauvegardé" :
    saveStatus === "error"  ? "⚠ Erreur" :
    "Auto-sauvegarde";

  const statusColor =
    saveStatus === "saved"  ? "var(--color-forest)" :
    saveStatus === "error"  ? "#DC2626" :
    "var(--color-muted)";

  return (
    <div className="max-w-lg mx-auto px-6 pt-6 pb-40 md:pb-16">

      {/* Toolbar haut */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onClose}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: "none", border: "none", cursor: "pointer",
            color: "var(--color-forest)", fontFamily: "var(--font-body)",
            fontSize: "14px", fontWeight: 500, padding: "8px 0",
          }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "12px", color: statusColor, fontFamily: "var(--font-body)", transition: "color 0.3s" }}>
            {statusText}
          </span>
          {confirmDelete ? (
            <div style={{ display: "flex", gap: "6px", marginLeft: "4px" }}>
              <button
                onClick={onDelete}
                style={{ padding: "6px 12px", borderRadius: "8px", background: "#DC2626", color: "#fff", border: "none", fontSize: "12px", fontFamily: "var(--font-body)", cursor: "pointer", fontWeight: 600 }}
              >
                Supprimer
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{ padding: "6px 10px", borderRadius: "8px", background: "var(--surface-2)", color: "var(--color-ink)", border: "1px solid var(--color-border)", fontSize: "12px", fontFamily: "var(--font-body)", cursor: "pointer" }}
              >
                Annuler
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              style={{ color: "var(--color-muted)", background: "none", border: "none", cursor: "pointer", padding: "6px" }}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Auteur + date */}
      <p style={{ fontSize: "11px", color: "var(--color-muted)", fontFamily: "var(--font-body)", marginBottom: "14px", letterSpacing: "0.3px" }}>
        Par {authorName} · {formatDate(note.updated_at)}
      </p>

      {/* Titre */}
      <input
        value={title}
        onChange={(e) => handleTitle(e.target.value)}
        placeholder="Titre…"
        style={{
          width: "100%", border: "none", outline: "none", background: "transparent",
          fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 500,
          color: "var(--color-ink)", letterSpacing: "-0.5px", marginBottom: "14px",
          padding: 0, lineHeight: 1.2,
        }}
      />

      {/* Barre de formatage */}
      <div
        style={{
          display: "flex", alignItems: "center", gap: "2px",
          padding: "6px 8px", borderRadius: "12px",
          background: "var(--surface-2)", border: "0.5px solid var(--color-border)",
          marginBottom: "14px", flexWrap: "wrap",
        }}
      >
        <FmtBtn title="Gras" onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive("bold")}>
          <IconBold size={15} stroke={2} />
        </FmtBtn>
        <FmtBtn title="Italique" onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive("italic")}>
          <IconItalic size={15} stroke={2} />
        </FmtBtn>
        <FmtBtn title="Souligné" onClick={() => editor?.chain().focus().toggleUnderline().run()} active={editor?.isActive("underline")}>
          <IconUnderline size={15} stroke={2} />
        </FmtBtn>
        <FmtBtn title="Barré" onClick={() => editor?.chain().focus().toggleStrike().run()} active={editor?.isActive("strike")}>
          <IconStrikethrough size={15} stroke={2} />
        </FmtBtn>

        {/* Séparateur */}
        <div style={{ width: "1px", height: "20px", background: "var(--color-border)", margin: "0 4px" }} />

        <FmtBtn title="Titre 1" onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} active={editor?.isActive("heading", { level: 1 })}>
          <IconH1 size={16} stroke={1.75} />
        </FmtBtn>
        <FmtBtn title="Titre 2" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive("heading", { level: 2 })}>
          <IconH2 size={16} stroke={1.75} />
        </FmtBtn>

        {/* Séparateur */}
        <div style={{ width: "1px", height: "20px", background: "var(--color-border)", margin: "0 4px" }} />

        <FmtBtn title="Liste à puces" onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive("bulletList")}>
          <IconList size={16} stroke={1.75} />
        </FmtBtn>
        <FmtBtn title="Liste à cocher" onClick={() => editor?.chain().focus().toggleTaskList().run()} active={editor?.isActive("taskList")}>
          <IconListCheck size={16} stroke={1.75} />
        </FmtBtn>
      </div>

      {/* Séparateur */}
      <div style={{ height: "1px", background: "var(--color-border)", marginBottom: "16px" }} />

      {/* Contenu Tiptap */}
      <div className="tiptap-editor">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
