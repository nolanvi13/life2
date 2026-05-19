"use client";

import { useEffect } from "react";
import type { Recette } from "@/lib/recettes";
import { formatQty } from "@/lib/recettes";
import type { ItemCourse } from "@/lib/recettes";

interface Props {
  recette: Recette;
  onClose: () => void;
  onDelete?: () => void;
  onAddToCourses?: (items: Omit<ItemCourse, "id" | "couple_id" | "created_at">[]) => Promise<void>;
}

export function RecetteModal({ recette, onClose, onDelete, onAddToCourses }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function handleAddToCourses() {
    if (!onAddToCourses) return;
    const { getIngredientCategory } = await import("@/lib/recettes");
    const items = recette.ingredients.map((ing) => ({
      name: ing.name,
      quantity: ing.quantity != null ? String(ing.quantity) : null,
      unit: ing.unit,
      category: ing.category ?? getIngredientCategory(ing.name),
      checked: false,
      recette_id: recette.id,
    }));
    await onAddToCourses(items);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" role="dialog" aria-modal="true">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        className="relative w-full md:max-w-lg md:rounded-3xl rounded-t-3xl max-h-[92vh] flex flex-col animate-fade-up"
        style={{ background: "var(--bg)", boxShadow: "var(--shadow-xl, 0 25px 60px rgba(0,0,0,0.25))" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 gap-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-4xl leading-none">{recette.emoji}</span>
            <div className="min-w-0">
              <h2
                className="text-lg font-bold leading-tight"
                style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}
              >
                {recette.title}
              </h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                  ⏱ {recette.prep_time}
                </span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  👥 {recette.portions} portions
                </span>
                {recette.microwave_friendly && (
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>📦 Tupperware ok</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {onDelete && (
              <button
                onClick={onDelete}
                className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                style={{ color: "var(--text-xmuted)" }}
                aria-label="Supprimer"
              >
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
              style={{ color: "var(--text-xmuted)" }}
              aria-label="Fermer"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {/* Ingredients */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--accent-green)", fontFamily: "var(--font-display)" }}>
              Ingrédients
            </h3>
            <div className="space-y-1.5">
              {recette.ingredients.map((ing, i) => (
                <div key={i} className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid var(--border)" }}>
                  <span className="text-sm" style={{ color: "var(--text)" }}>{ing.name}</span>
                  <span className="text-sm font-semibold tabular-nums" style={{ color: "var(--text-muted)" }}>
                    {formatQty(ing.quantity, ing.unit)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Steps */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--accent-green)", fontFamily: "var(--font-display)" }}>
              Préparation
            </h3>
            <ol className="space-y-3">
              {recette.steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: "var(--pastel-green)", color: "var(--accent-green)" }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm pt-0.5 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          {/* Tips */}
          {recette.tips?.length > 0 && (
            <section
              className="rounded-2xl p-4"
              style={{ background: "var(--pastel-green)", border: "1px solid var(--border)" }}
            >
              <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--accent-green)" }}>
                💡 Astuces
              </p>
              <ul className="space-y-1.5">
                {recette.tips.map((tip, i) => (
                  <li key={i} className="text-sm" style={{ color: "var(--text-muted)" }}>
                    • {tip}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Footer CTA */}
        {onAddToCourses && (
          <div className="p-4 pt-0" style={{ borderTop: "1px solid var(--border)" }}>
            <button
              onClick={handleAddToCourses}
              className="w-full py-3 rounded-2xl text-sm font-bold transition-all duration-200"
              style={{
                background: "var(--pastel-green)",
                color: "var(--accent-green)",
                border: "1px solid var(--accent-green)30",
              }}
            >
              🛒 Ajouter à la liste de courses
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
