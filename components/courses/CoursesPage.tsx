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
  background: "#fff",
  border: "1px solid var(--color-border)",
  color: "var(--color-ink)",
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

function ItemRow({ item, editing, onToggleCheck, onDelete, onStartEdit, onSaveEdit, onCancelEdit, onEditChange }: ItemRowProps) {
  const isEditing = editing?.id === item.id;

  return (
    <div
      className="flex items-center gap-3 group"
      style={{
        padding: "12px 16px",
        background: "#fff",
        border: "0.5px solid var(--color-border)",
        borderRadius: "10px",
        transition: "opacity 0.15s",
      }}
    >
      {/* Checkbox */}
      <button
        onClick={() => { onCancelEdit(); onToggleCheck(item.id, true); }}
        style={{
          flexShrink: 0,
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          border: "1.5px solid var(--color-border)",
          cursor: "pointer",
          background: "transparent",
          transition: "all 0.15s",
        }}
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
              style={{ ...inputStyle, borderRadius: "8px", padding: "0 10px" }}
            />
            <input
              value={editing.quantity}
              onChange={(e) => onEditChange({ quantity: e.target.value })}
              onKeyDown={(e) => { if (e.key === "Enter") onSaveEdit(); if (e.key === "Escape") onCancelEdit(); }}
              placeholder="Qté"
              className="w-14 h-8 px-2 rounded-xl text-sm text-center"
              style={{ ...inputStyle, borderRadius: "8px" }}
            />
            <input
              value={editing.unit}
              onChange={(e) => onEditChange({ unit: e.target.value })}
              onKeyDown={(e) => { if (e.key === "Enter") onSaveEdit(); if (e.key === "Escape") onCancelEdit(); }}
              placeholder="g/ml…"
              className="w-14 h-8 px-2 rounded-xl text-sm"
              style={{ ...inputStyle, borderRadius: "8px" }}
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
        <div className="text-sm" style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>Chargement…</div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-6 pt-9 pb-32 md:pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "34px",
            fontWeight: 500,
            color: "var(--color-ink)",
            letterSpacing: "-0.8px",
          }}
        >
          Courses
        </h1>
        {items.length > 0 && (
          <div className="flex gap-2">
            {checked.length > 0 && (
              <button
                onClick={clearChecked}
                style={{
                  padding: "9px 14px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontFamily: "var(--font-body)",
                  background: "transparent",
                  color: "var(--color-muted)",
                  border: "1px solid var(--color-border)",
                  cursor: "pointer",
                }}
              >
                Supprimer ✓
              </button>
            )}
            <button
              onClick={clearAll}
              style={{
                padding: "9px 14px",
                borderRadius: "10px",
                fontSize: "13px",
                fontFamily: "var(--font-body)",
                background: "transparent",
                color: "#C4614A",
                border: "1px solid rgba(196,97,74,0.3)",
                cursor: "pointer",
              }}
            >
              Tout vider
            </button>
          </div>
        )}
      </div>

      {/* Add item form */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Ajouter un article…"
          style={{
            flex: 1,
            height: "44px",
            padding: "0 16px",
            borderRadius: "12px",
            border: "1px solid var(--color-border)",
            fontFamily: "var(--font-body)",
            fontSize: "14px",
            color: "var(--color-ink)",
            background: "#fff",
            outline: "none",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--color-forest)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
        />
        <button
          type="submit"
          disabled={!newName.trim() || adding}
          style={{
            width: "44px",
            height: "44px",
            background: "var(--color-forest)",
            border: "none",
            borderRadius: "10px",
            color: "#fff",
            fontSize: "20px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: !newName.trim() || adding ? 0.4 : 1,
            transition: "opacity 0.15s",
          }}
        >
          +
        </button>
      </form>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🛒</p>
          <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>La liste est vide</p>
          <p style={{ fontSize: "12px", marginTop: "4px", color: "var(--text-xmuted)", fontFamily: "var(--font-body)" }}>Ajoute des articles ou importe depuis une recette</p>
        </div>
      )}

      {/* Unchecked items grouped by category */}
      {activeCategories.map((cat) => (
        <section key={cat}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", margin: "20px 0 8px" }}>
            <span style={{ fontSize: "14px" }}>{CATEGORY_ICONS[cat] ?? "🛍️"}</span>
            <h2
              style={{
                fontSize: "11px",
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                letterSpacing: "0.8px",
                textTransform: "uppercase",
                color: "var(--color-muted)",
              }}
            >
              {cat}
            </h2>
            <span style={{ fontSize: "11px", color: "var(--text-xmuted)", fontFamily: "var(--font-body)" }}>({grouped[cat].length})</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
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
        <section style={{ marginTop: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", margin: "0 0 8px" }}>
            <h2
              style={{
                fontSize: "11px",
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                letterSpacing: "0.8px",
                textTransform: "uppercase",
                color: "var(--text-xmuted)",
              }}
            >
              Dans le panier ({checked.length})
            </h2>
          </div>
          <div style={{ opacity: 0.5, display: "flex", flexDirection: "column", gap: "6px" }}>
            {checked.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 group"
                style={{
                  padding: "12px 16px",
                  background: "#fff",
                  border: "0.5px solid var(--color-border)",
                  borderRadius: "10px",
                }}
              >
                <button
                  onClick={() => toggleCheck(item.id, false)}
                  style={{
                    flexShrink: 0,
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--color-forest)",
                    border: "2px solid var(--color-forest)",
                    cursor: "pointer",
                  }}
                  aria-label="Décocher"
                >
                  <svg width="9" height="7" viewBox="0 0 11 9" fill="none">
                    <path d="M1 4l3.5 3.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <span className="flex-1 text-sm line-through" style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>{item.name}</span>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-full"
                  style={{ color: "var(--text-xmuted)", cursor: "pointer" }}
                >
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <p style={{ fontSize: "12px", textAlign: "center", marginTop: "24px", color: "var(--text-xmuted)", fontFamily: "var(--font-body)" }}>
        Liste partagée en temps réel avec ton couple
      </p>
    </div>
  );
}
