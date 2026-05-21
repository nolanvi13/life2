"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { useNotes } from "@/hooks/useNotes";
import type { Note } from "@/lib/notes";

type SaveStatus = "idle" | "saving" | "saved" | "error";

const MOIS = ["jan","fév","mar","avr","mai","juin","juil","aoû","sep","oct","nov","déc"];

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = diffMs / 3600000;
  if (diffH < 1) return "À l'instant";
  if (diffH < 24) return `Il y a ${Math.floor(diffH)}h`;
  if (diffH < 48) return "Hier";
  return `${d.getDate()} ${MOIS[d.getMonth()]}`;
}

function notePreview(note: Note): string {
  if (note.content.trim()) return note.content.replace(/\n/g, " ").slice(0, 60);
  return "Pas de contenu";
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
  const [content, setContent] = useState(note.content);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Refs toujours à jour pour la closure de l'unmount
  const latestTitle = useRef(note.title);
  const latestContent = useRef(note.content);
  const onUpdateRef = useRef(onUpdate);
  useEffect(() => { latestTitle.current = title; }, [title]);
  useEffect(() => { latestContent.current = content; }, [content]);
  useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);

  // Auto-resize textarea
  useEffect(() => {
    const el = contentRef.current;
    if (el) { el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; }
  }, [content]);

  const save = useCallback((t: string, c: string) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus("saving");
    saveTimer.current = setTimeout(async () => {
      saveTimer.current = null; // marquer comme déclenché
      try {
        await onUpdateRef.current({ title: t, content: c });
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (e) {
        console.error("[NoteEditor] save failed:", e);
        setSaveStatus("error");
      }
    }, 600);
  }, []);

  function handleTitle(v: string) { setTitle(v); save(v, content); }
  function handleContent(v: string) { setContent(v); save(title, v); }

  // Sauvegarde à la fermeture — utilise les refs pour avoir les valeurs actuelles
  useEffect(() => {
    return () => {
      if (saveTimer.current) {
        // Il reste une sauvegarde en attente : l'exécuter tout de suite avec les vraies valeurs
        clearTimeout(saveTimer.current);
        onUpdateRef.current({ title: latestTitle.current, content: latestContent.current });
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const statusText =
    saveStatus === "saving" ? "Sauvegarde…" :
    saveStatus === "saved"  ? "✓ Sauvegardé" :
    saveStatus === "error"  ? "⚠ Erreur sauvegarde" :
    "Auto-sauvegarde";

  const statusColor =
    saveStatus === "saved"  ? "var(--color-forest)" :
    saveStatus === "error"  ? "#DC2626" :
    "var(--color-muted)";

  return (
    <div className="max-w-lg mx-auto px-6 pt-6 pb-32 md:pb-10">
      {/* Toolbar */}
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

        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ fontSize: "12px", color: statusColor, fontFamily: "var(--font-body)", transition: "color 0.3s" }}>
            {statusText}
          </span>
          {confirmDelete ? (
            <div style={{ display: "flex", gap: "6px", marginLeft: "8px" }}>
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
              style={{ marginLeft: "8px", color: "var(--color-muted)", background: "none", border: "none", cursor: "pointer", padding: "6px" }}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Author + date */}
      <p style={{ fontSize: "11px", color: "var(--color-muted)", fontFamily: "var(--font-body)", marginBottom: "16px", letterSpacing: "0.3px" }}>
        Par {authorName} · {formatDate(note.updated_at)}
      </p>

      {/* Title */}
      <input
        value={title}
        onChange={(e) => handleTitle(e.target.value)}
        placeholder="Titre…"
        style={{
          width: "100%", border: "none", outline: "none", background: "transparent",
          fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 500,
          color: "var(--color-ink)", letterSpacing: "-0.5px", marginBottom: "16px",
          padding: 0, lineHeight: 1.2,
        }}
      />

      {/* Divider */}
      <div style={{ height: "1px", background: "var(--color-border)", marginBottom: "16px" }} />

      {/* Content */}
      <textarea
        ref={contentRef}
        value={content}
        onChange={(e) => handleContent(e.target.value)}
        placeholder="Commence à écrire…"
        style={{
          width: "100%", border: "none", outline: "none", background: "transparent",
          fontFamily: "var(--font-body)", fontSize: "15px", lineHeight: 1.7,
          color: "var(--color-ink)", resize: "none", minHeight: "300px",
          padding: 0,
        }}
      />
    </div>
  );
}
