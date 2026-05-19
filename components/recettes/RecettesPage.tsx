"use client";

import { useState } from "react";
import { useRecettes } from "@/hooks/useRecettes";
import { useCoursesActions } from "@/hooks/useCoursesActions";
import { RecetteCard } from "./RecetteCard";
import { RecetteModal } from "./RecetteModal";
import { AddRecetteModal } from "./AddRecetteModal";
import type { Recette, ItemCourse } from "@/lib/recettes";
import { RECETTE_CATEGORIES } from "@/lib/recettes";
import { useApp } from "@/components/providers/AppProvider";

const ALL = "Toutes";

export function RecettesPage() {
  const { coupleId } = useApp();
  const { recettes, loading, addRecette, deleteRecette, toggleWeek } = useRecettes(coupleId);
  const { addManyItems, removeByRecette } = useCoursesActions(coupleId);

  const [selectedFilter, setSelectedFilter] = useState<string>(ALL);
  const [openRecette, setOpenRecette] = useState<Recette | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const filters = [ALL, ...RECETTE_CATEGORIES];

  const filtered = selectedFilter === ALL
    ? recettes
    : recettes.filter((r) => r.category === selectedFilter);

  const weekRecettes = recettes.filter((r) => r.in_week);

  async function handleToggleWeek(recette: Recette) {
    const addingToWeek = !recette.in_week;
    await toggleWeek(recette.id, addingToWeek);
    if (addingToWeek && recette.ingredients.length > 0) {
      // Coche → ajoute les ingrédients aux courses
      const { getIngredientCategory } = await import("@/lib/recettes");
      await addManyItems(recette.ingredients.map((ing) => ({
        name: ing.name,
        quantity: ing.quantity != null ? String(ing.quantity) : null,
        unit: ing.unit,
        category: ing.category ?? getIngredientCategory(ing.name),
        recette_id: recette.id,
      })));
    } else if (!addingToWeek) {
      // Décoche → retire les ingrédients de la liste
      await removeByRecette(recette.id);
    }
  }

  async function handleAddToCourses(items: Omit<ItemCourse, "id" | "couple_id" | "created_at">[]) {
    await addManyItems(items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      recette_id: item.recette_id,
    })));
  }

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
          Recettes
        </h1>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            background: "var(--color-forest)",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "9px 16px",
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          + Ajouter
        </button>
      </div>

      {/* Cette semaine strip */}
      {weekRecettes.length > 0 && (
        <div
          className="mb-5 overflow-x-auto scrollbar-none"
          style={{
            background: "var(--color-module-budget)",
            borderRadius: "12px",
            padding: "12px 16px",
            border: "0.5px solid var(--color-border)",
          }}
        >
          <p style={{ fontSize: "11px", fontFamily: "var(--font-body)", fontWeight: 500, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--color-forest)", marginBottom: "8px" }}>
            Cette semaine
          </p>
          <div className="flex gap-2">
            {weekRecettes.map((r) => (
              <button
                key={r.id}
                onClick={() => setOpenRecette(r)}
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 500,
                  background: "#fff",
                  color: "var(--color-ink)",
                  border: "0.5px solid var(--color-border)",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                }}
              >
                <span>{r.emoji}</span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "14px" }}>{r.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category filters */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1 scrollbar-none">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setSelectedFilter(f)}
            style={{
              flexShrink: 0,
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "13px",
              fontFamily: "var(--font-body)",
              border: `1px solid ${selectedFilter === f ? "var(--color-forest)" : "var(--color-border)"}`,
              background: selectedFilter === f ? "var(--color-forest)" : "transparent",
              color: selectedFilter === f ? "#fff" : "var(--color-ink-soft)",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.15s",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🍽️</p>
          <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
            {recettes.length === 0 ? "Aucune recette pour l'instant" : "Aucune recette dans cette catégorie"}
          </p>
          {recettes.length === 0 && (
            <button
              onClick={() => setShowAdd(true)}
              style={{
                marginTop: "16px",
                padding: "9px 18px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 500,
                background: "var(--color-forest)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
              }}
            >
              Ajouter la première
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((r) => (
            <RecetteCard
              key={r.id}
              recette={r}
              onOpenDetail={() => setOpenRecette(r)}
              onToggleWeek={() => handleToggleWeek(r)}
            />
          ))}
        </div>
      )}

      {/* Detail modal */}
      {openRecette && (
        <RecetteModal
          recette={openRecette}
          onClose={() => setOpenRecette(null)}
          onDelete={async () => {
            await deleteRecette(openRecette.id);
            setOpenRecette(null);
          }}
          onAddToCourses={handleAddToCourses}
        />
      )}

      {/* Add modal */}
      {showAdd && (
        <AddRecetteModal
          onClose={() => setShowAdd(false)}
          onAdd={async (recipe) => {
            await addRecette(recipe);
          }}
        />
      )}
    </div>
  );
}
