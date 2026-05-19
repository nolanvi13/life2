"use client";

import type { Recette } from "@/lib/recettes";

interface Props {
  recette: Recette;
  onOpenDetail: () => void;
  onToggleWeek: () => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  "Pâtes":             { bg: "var(--pastel-peach)",  color: "#C2600A" },
  "Riz & Bowls":       { bg: "var(--pastel-yellow)", color: "#8B6914" },
  "Bouillons & Soupes":{ bg: "var(--pastel-blue)",   color: "#1A5FA8" },
  "Viande":            { bg: "#FFE0E0",               color: "#B91C1C" },
  "Poisson":           { bg: "var(--pastel-blue)",   color: "#0E6BB3" },
  "Végétarien":        { bg: "var(--pastel-green)",  color: "#15803D" },
  "Salades":           { bg: "#DCFCE7",               color: "#166534" },
  "Autre":             { bg: "var(--surface-2)",      color: "var(--text-muted)" },
};

export function RecetteCard({ recette, onOpenDetail, onToggleWeek }: Props) {
  const { bg, color } = CATEGORY_COLORS[recette.category] ?? CATEGORY_COLORS["Autre"];

  return (
    <div
      className="group relative rounded-3xl overflow-hidden transition-all duration-200"
      style={{
        background: "var(--surface)",
        border: `1.5px solid ${recette.in_week ? "var(--accent-green)" : "var(--border)"}`,
        boxShadow: recette.in_week ? "0 0 0 3px var(--accent-green)18" : "none",
      }}
    >
      {/* Week toggle button */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleWeek(); }}
        aria-label={recette.in_week ? "Retirer de la semaine" : "Ajouter à la semaine"}
        className="absolute top-3 right-3 z-10 flex items-center justify-center w-6 h-6 rounded-full transition-all duration-200"
        style={{
          background: recette.in_week ? "var(--accent-green)" : "var(--surface-2)",
          border: `1.5px solid ${recette.in_week ? "var(--accent-green)" : "var(--border)"}`,
        }}
      >
        {recette.in_week ? (
          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
            <path d="M1 4l3.5 3.5L10 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <span style={{ color: "var(--text-xmuted)", fontSize: "14px", lineHeight: 1 }}>+</span>
        )}
      </button>

      {/* Card body */}
      <button onClick={onOpenDetail} className="w-full text-left p-4 pr-10">
        <div className="flex items-start gap-3">
          <span className="text-3xl leading-none flex-shrink-0 mt-0.5">{recette.emoji}</span>
          <div className="min-w-0 flex-1">
            <h3
              className="font-bold text-sm leading-snug mb-1.5"
              style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}
            >
              {recette.title}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold"
                style={{ background: bg, color }}
              >
                {recette.category}
              </span>
              <span className="text-xs" style={{ color: "var(--text-xmuted)" }}>
                ⏱ {recette.prep_time}
              </span>
              {recette.microwave_friendly && (
                <span className="text-xs" style={{ color: "var(--text-xmuted)" }}>📦</span>
              )}
            </div>
          </div>
        </div>

        {recette.in_week && (
          <div className="mt-2 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
            <span className="text-xs font-bold" style={{ color: "var(--accent-green)" }}>
              ✓ Cette semaine
            </span>
          </div>
        )}
      </button>
    </div>
  );
}
