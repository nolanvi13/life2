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
        <div className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-32 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}>
          Recettes 🍽️
        </h1>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150"
          style={{ background: "var(--pastel-green)", color: "var(--accent-green)" }}
        >
          <span>+</span>
          <span>Ajouter</span>
        </button>
      </div>

      {/* Cette semaine strip */}
      {weekRecettes.length > 0 && (
        <div
          className="rounded-2xl p-3 mb-5 overflow-x-auto"
          style={{ background: "var(--pastel-green)", border: "1px solid var(--border)" }}
        >
          <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--accent-green)" }}>
            Cette semaine
          </p>
          <div className="flex gap-2">
            {weekRecettes.map((r) => (
              <button
                key={r.id}
                onClick={() => setOpenRecette(r)}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium"
                style={{ background: "white", color: "var(--text)", border: "1px solid var(--border)" }}
              >
                <span>{r.emoji}</span>
                <span style={{ fontFamily: "var(--font-display)" }}>{r.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category filters */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-none">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setSelectedFilter(f)}
            className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150"
            style={{
              background: selectedFilter === f ? "var(--accent-green)" : "var(--surface-2)",
              color: selectedFilter === f ? "white" : "var(--text-muted)",
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
          <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            {recettes.length === 0
              ? "Aucune recette pour l'instant"
              : "Aucune recette dans cette catégorie"}
          </p>
          {recettes.length === 0 && (
            <button
              onClick={() => setShowAdd(true)}
              className="mt-4 px-4 py-2 rounded-xl text-sm font-bold"
              style={{ background: "var(--pastel-green)", color: "var(--accent-green)" }}
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
