"use client";

import { useRef } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Write-only courses actions — no realtime channel subscription.
 * Use this when you only need to add/remove items (e.g. from RecettesPage)
 * without creating a duplicate channel alongside the one in useCourses.
 */
export function useCoursesActions(coupleId: string) {
  const supabase = useRef(createClient()).current;

  async function addManyItems(rows: Array<{
    name: string;
    quantity?: string | null;
    unit?: string | null;
    category: string;
    recette_id?: string | null;
  }>) {
    if (!coupleId) return;
    const { error } = await supabase
      .from("items_courses")
      .insert(rows.map((r) => ({ ...r, couple_id: coupleId, checked: false })));
    if (error) throw error;
  }

  async function removeByRecette(recetteId: string) {
    if (!coupleId) return;
    await supabase
      .from("items_courses")
      .delete()
      .eq("recette_id", recetteId)
      .eq("couple_id", coupleId);
  }

  return { addManyItems, removeByRecette };
}
