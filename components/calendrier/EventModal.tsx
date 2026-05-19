"use client";

import { useEffect, useState } from "react";
import { CATEGORIES, CATEGORIE_COLORS, type Evenement, type EventCategorie } from "@/hooks/useCalendrier";

interface Props {
  initial?: Partial<Evenement> & { date?: string };
  onClose: () => void;
  onSave: (ev: Omit<Evenement, "id" | "couple_id" | "created_at">) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export function EventModal({ initial, onClose, onSave, onDelete }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [date, setDate] = useState(initial?.date ?? "");
  const [endDate, setEndDate] = useState(initial?.end_date ?? "");
  const [time, setTime] = useState(initial?.time ?? "");
  const [categorie, setCategorie] = useState<EventCategorie>(initial?.categorie ?? "Autre");
  const [note, setNote] = useState(initial?.note ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose]);

  async function handleSave() {
    if (!title.trim() || !date) return;
    setSaving(true);
    await onSave({ title: title.trim(), date, end_date: endDate || null, time: time || null, categorie, note: note || null });
    onClose();
  }

  const inputStyle = { background: "var(--surface-2)", border: "1.5px solid var(--border)", color: "var(--text)", outline: "none" };
  const { bg, color } = CATEGORIE_COLORS[categorie];

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:max-w-md md:rounded-3xl rounded-t-3xl animate-fade-up overflow-hidden"
        style={{ background: "var(--bg)", boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }}>
        {/* Color bar */}
        <div className="h-1.5 w-full" style={{ background: color }} />

        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}>
              {initial?.id ? "Modifier" : "Nouvel événement"}
            </h2>
            <div className="flex gap-1">
              {onDelete && (
                <button onClick={async () => { await onDelete(); onClose(); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full" style={{ color: "#EF4444" }}>
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full" style={{ color: "var(--text-xmuted)" }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Title */}
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre de l'événement"
            className="w-full h-11 px-3 rounded-2xl text-sm" style={inputStyle} autoFocus />

          {/* Date + time */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-xmuted)" }}>Date *</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="h-10 px-3 rounded-2xl text-sm" style={inputStyle} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-xmuted)" }}>Heure</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                className="h-10 px-3 rounded-2xl text-sm" style={inputStyle} />
            </div>
          </div>

          {/* End date */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-xmuted)" }}>Date de fin (optionnel)</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="h-10 px-3 rounded-2xl text-sm" style={inputStyle} />
          </div>

          {/* Catégorie pills */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-xmuted)" }}>Catégorie</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => {
                const active = c === categorie;
                const col = CATEGORIE_COLORS[c];
                return (
                  <button key={c} onClick={() => setCategorie(c)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                    style={{ background: active ? col.bg : "var(--surface-2)", color: active ? col.color : "var(--text-muted)", border: `1.5px solid ${active ? col.color + "40" : "var(--border)"}` }}>
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-xmuted)" }}>Note (optionnel)</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Détails, adresse…"
              className="px-3 py-2.5 rounded-2xl text-sm resize-none outline-none" style={inputStyle} />
          </div>

          <button onClick={handleSave} disabled={!title.trim() || !date || saving}
            className="w-full py-3 rounded-2xl text-sm font-bold transition-all disabled:opacity-40"
            style={{ background: bg, color }}>
            {saving ? "Enregistrement…" : initial?.id ? "Modifier" : "Créer l'événement"}
          </button>
        </div>
      </div>
    </div>
  );
}
