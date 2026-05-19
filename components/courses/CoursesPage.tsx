"use client";

import { useState } from "react";
import { useCourses } from "@/hooks/useCourses";
import { CATEGORY_ICONS, CATEGORY_ORDER, getIngredientCategory } from "@/lib/recettes";
import type { ItemCourse } from "@/lib/recettes";
import { useApp } from "@/components/providers/AppProvider";

interface EditState {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  category: string;
}

const inputStyle = {
  background: "var(--bg)",
  border: "1.5px solid var(--accent-green)",
  color: "var(--text)",
  outline: "none",
};

interface ItemRowProps {
  item: ItemCourse;
  idx: number;
  total: number;
  editing: EditState | null;
  onToggleCheck: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
  onStartEdit: (item: ItemCourse) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditChange: (patch: Partial<EditState>) => void;
}

function ItemRow({ item, idx, total, editing, onToggleCheck, onDelete, onStartEdit, onSaveEdit, onCancelEdit, onEditChange }: ItemRowProps) {
  const isEditing = editing?.id === item.id;

  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 group"
      style={{ borderBottom: idx < total - 1 ? "1px solid var(--border)" : "none" }}
    >
      {/* Checkbox */}
      <button
        onClick={() => { onCancelEdit(); onToggleCheck(item.id, true); }}
        className="flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-150"
        style={{ borderColor: "var(--border)" }}
        aria-label="Cocher"
      />

      {isEditing && editing ? (
        /* ── Edit mode ── */
        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
          {/* Row 1 : nom + qté + unité + actions */}
          <div className="flex items-center gap-1.5">
            <input
              autoFocus
              value={editing.name}
              onChange={(e) => onEditChange({ name: e.target.value })}
              onKeyDown={(e) => { if (e.key === "Enter") onSaveEdit(); if (e.key === "Escape") onCancelEdit(); }}
              className="flex-1 h-8 px-2.5 rounded-xl text-sm min-w-0"
              style={inputStyle}
            />
            <input
              value={editing.quantity}
              onChange={(e) => onEditChange({ quantity: e.target.value })}
              onKeyDown={(e) => { if (e.key === "Enter") onSaveEdit(); if (e.key === "Escape") onCancelEdit(); }}
              placeholder="Qté"
              className="w-14 h-8 px-2 rounded-xl text-sm text-center"
              style={inputStyle}
            />
            <input
              value={editing.unit}
              onChange={(e) => onEditChange({ unit: e.target.value })}
              onKeyDown={(e) => { if (e.key === "Enter") onSaveEdit(); if (e.key === "Escape") onCancelEdit(); }}
              placeholder="g/ml…"
              className="w-14 h-8 px-2 rounded-xl text-sm"
              style={inputStyle}
            />
            <button
              onClick={onSaveEdit}
              className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0"
              style={{ background: "var(--pastel-green)", color: "var(--accent-green)" }}
            >
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              onClick={onCancelEdit}
              className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0"
              style={{ color: "var(--text-xmuted)", background: "var(--surface-2)" }}
            >
              <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Row 2 : catégorie */}
          <select
            value={editing.category}
            onChange={(e) => onEditChange({ category: e.target.value })}
            className="h-8 px-2.5 rounded-xl text-xs w-full"
            style={inputStyle}
          >
            {[...CATEGORY_ORDER, "Divers"].filter((v, i, a) => a.indexOf(v) === i).map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_ICONS[cat] ?? "🛍️"} {cat}
              </option>
            ))}
          </select>
        </div>
      ) : (
        /* ── Display mode ── */
        <>
          <button
            className="flex-1 text-left min-w-0 py-0.5"
            onClick={() => onStartEdit(item)}
          >
            <span className="text-sm" style={{ color: "var(--text)" }}>{item.name}</span>
            {(item.quantity || item.unit) && (
              <span className="text-xs ml-1.5" style={{ color: "var(--text-xmuted)" }}>
                {[item.quantity, item.unit].filter(Boolean).join(" ")}
              </span>
            )}
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-full transition-all flex-shrink-0"
            style={{ color: "var(--text-xmuted)" }}
          >
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}

export function CoursesPage() {
  const { coupleId } = useApp();
  const { items, loading, addItem, toggleCheck, deleteItem, updateItem, clearChecked, clearAll } = useCourses(coupleId);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<EditState | null>(null);

  const unchecked = items.filter((i) => !i.checked);
  const checked = items.filter((i) => i.checked);

  const grouped: Record<string, typeof items> = {};
  for (const cat of CATEGORY_ORDER) grouped[cat] = [];
  for (const item of unchecked) {
    const cat = item.category ?? "Divers";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  }
  const activeCategories = CATEGORY_ORDER.filter((c) => grouped[c].length > 0);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    await addItem({ name: newName.trim(), category: getIngredientCategory(newName.trim()) });
    setNewName("");
    setAdding(false);
  }

  function startEdit(item: ItemCourse) {
    setEditing({
      id: item.id,
      name: item.name,
      quantity: item.quantity ?? "",
      unit: item.unit ?? "",
      category: item.category ?? "Divers",
    });
  }

  async function saveEdit() {
    if (!editing) return;
    await updateItem(editing.id, {
      name: editing.name.trim() || editing.name,
      quantity: editing.quantity.trim() || null,
      unit: editing.unit.trim() || null,
      category: editing.category,
    });
    setEditing(null);
  }

  function cancelEdit() { setEditing(null); }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-32 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}>
          Courses 🛒
        </h1>
        {items.length > 0 && (
          <div className="flex gap-2">
            {checked.length > 0 && (
              <button onClick={clearChecked} className="px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
                Supprimer ✓
              </button>
            )}
            <button onClick={clearAll} className="px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{ background: "#FEE2E2", color: "#B91C1C" }}>
              Tout vider
            </button>
          </div>
        )}
      </div>

      {/* Add item form */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
          placeholder="Ajouter un article…"
          className="flex-1 h-11 px-3 rounded-2xl text-sm outline-none"
          style={{ background: "var(--surface-2)", border: "1.5px solid var(--border)", color: "var(--text)" }}
        />
        <button type="submit" disabled={!newName.trim() || adding}
          className="h-11 px-4 rounded-2xl text-sm font-bold transition-all disabled:opacity-40"
          style={{ background: "var(--pastel-green)", color: "var(--accent-green)" }}>
          +
        </button>
      </form>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🛒</p>
          <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>La liste est vide</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-xmuted)" }}>Ajoute des articles ou importe depuis une recette</p>
        </div>
      )}

      {/* Unchecked items grouped by category */}
      {activeCategories.map((cat) => (
        <section key={cat} className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">{CATEGORY_ICONS[cat] ?? "🛍️"}</span>
            <h2 className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
              {cat}
            </h2>
            <span className="text-xs" style={{ color: "var(--text-xmuted)" }}>({grouped[cat].length})</span>
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            {grouped[cat].map((item, idx) => (
              <ItemRow
                key={item.id}
                item={item}
                idx={idx}
                total={grouped[cat].length}
                editing={editing}
                onToggleCheck={toggleCheck}
                onDelete={deleteItem}
                onStartEdit={startEdit}
                onSaveEdit={saveEdit}
                onCancelEdit={cancelEdit}
                onEditChange={(patch) => setEditing((p) => p ? { ...p, ...patch } : p)}
              />
            ))}
          </div>
        </section>
      ))}

      {/* Checked items */}
      {checked.length > 0 && (
        <section className="mt-6">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--text-xmuted)", fontFamily: "var(--font-display)" }}>
              Dans le panier ({checked.length})
            </h2>
          </div>
          <div className="rounded-2xl overflow-hidden opacity-60"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            {checked.map((item, idx) => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3 group"
                style={{ borderBottom: idx < checked.length - 1 ? "1px solid var(--border)" : "none" }}>
                <button onClick={() => toggleCheck(item.id, false)}
                  className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: "var(--accent-green)", border: "2px solid var(--accent-green)" }}
                  aria-label="Décocher">
                  <svg width="9" height="7" viewBox="0 0 11 9" fill="none">
                    <path d="M1 4l3.5 3.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <span className="flex-1 text-sm line-through" style={{ color: "var(--text-muted)" }}>{item.name}</span>
                <button onClick={() => deleteItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-full"
                  style={{ color: "var(--text-xmuted)" }}>
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="text-xs text-center mt-6" style={{ color: "var(--text-xmuted)" }}>
        Liste partagée en temps réel avec ton couple
      </p>
    </div>
  );
}
