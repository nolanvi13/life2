"use client";

import type { Recette } from "@/lib/recettes";
import { IconClock, IconFlame } from "@tabler/icons-react";

interface Props {
  recette: Recette;
  onOpenDetail: () => void;
  onToggleWeek: () => void;
}

export function RecetteCard({ recette, onOpenDetail, onToggleWeek }: Props) {
  return (
    <div
      style={{
        background: "#fff",
        border: recette.in_week
          ? `1.5px solid var(--color-forest)`
          : "0.5px solid var(--color-border)",
        borderRadius: "14px",
        overflow: "hidden",
        transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1), border-color 0.15s",
        cursor: "pointer",
        position: "relative",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = ""; }}
    >
      {/* Week toggle */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleWeek(); }}
        aria-label={recette.in_week ? "Retirer de la semaine" : "Ajouter à la semaine"}
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          zIndex: 10,
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: recette.in_week ? "var(--color-forest)" : "var(--surface-2)",
          border: `1px solid ${recette.in_week ? "var(--color-forest)" : "var(--color-border)"}`,
          cursor: "pointer",
        }}
      >
        {recette.in_week ? (
          <svg width="10" height="8" viewBox="0 0 11 9" fill="none">
            <path d="M1 4l3.5 3.5L10 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <span style={{ color: "var(--text-xmuted)", fontSize: "14px", lineHeight: 1 }}>+</span>
        )}
      </button>

      {/* Card body */}
      <button onClick={onOpenDetail} style={{ width: "100%", textAlign: "left", padding: "16px", paddingRight: "40px" }}>
        <div style={{ fontSize: "28px", lineHeight: 1, marginBottom: "10px" }}>
          {recette.emoji}
        </div>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "16px",
            fontWeight: 500,
            color: "var(--color-ink)",
            letterSpacing: "-0.3px",
            marginBottom: "8px",
            lineHeight: 1.2,
          }}
        >
          {recette.title}
        </h3>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span
            style={{
              display: "inline-block",
              padding: "3px 10px",
              borderRadius: "20px",
              fontSize: "11px",
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              background: "rgba(44,74,53,0.08)",
              color: "var(--color-forest)",
            }}
          >
            {recette.category}
          </span>
          <span
            style={{
              fontSize: "12px",
              color: "var(--color-muted)",
              display: "flex",
              alignItems: "center",
              gap: "3px",
              fontFamily: "var(--font-body)",
            }}
          >
            <IconClock size={12} stroke={1.5} />
            {recette.prep_time}
          </span>
          {recette.microwave_friendly && (
            <span style={{ fontSize: "11px", color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
              <IconFlame size={12} stroke={1.5} style={{ display: "inline" }} />
            </span>
          )}
        </div>

        {recette.in_week && (
          <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid var(--color-border)" }}>
            <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-forest)", fontFamily: "var(--font-body)" }}>
              ✓ Cette semaine
            </span>
          </div>
        )}
      </button>
    </div>
  );
}
