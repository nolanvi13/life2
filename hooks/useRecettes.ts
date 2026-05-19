"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Recette, Ingredient } from "@/lib/recettes";

export function useRecettes(coupleId: string) {
  const [recettes, setRecettes] = useState<Recette[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useRef(createClient()).current;
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const load = useCallback(async () => {
    if (!coupleId) return;
    const { data } = await supabase
      .from("recettes")
      .select("*")
      .eq("couple_id", coupleId)
      .order("created_at", { ascending: false });
    if (data) setRecettes(data as Recette[]);
    setLoading(false);
  }, [coupleId]);

  useEffect(() => {
    if (!coupleId) return;
    load();

    const channel = supabase
      .channel(`recettes:${coupleId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "recettes", filter: `couple_id=eq.${coupleId}` },
        () => load()
      )
      .subscribe();
    channelRef.current = channel;

    return () => { supabase.removeChannel(channel); };
  }, [coupleId, load]);

  async function addRecette(recipe: {
    slug: string;
    title: string;
    emoji: string;
    category: string;
    prep_time: string;
    portions: number;
    microwave_friendly: boolean;
    tips: string[];
    ingredients: Ingredient[];
    steps: string[];
    source_url?: string | null;
  }) {
    const { data, error } = await supabase
      .from("recettes")
      .insert({ ...recipe, couple_id: coupleId })
      .select()
      .single();
    if (error) throw error;
    setRecettes((prev) => [data as Recette, ...prev]);
    return data as Recette;
  }

  async function deleteRecette(id: string) {
    await supabase.from("recettes").delete().eq("id", id);
    setRecettes((prev) => prev.filter((r) => r.id !== id));
  }

  async function toggleWeek(id: string, inWeek: boolean) {
    await supabase.from("recettes").update({ in_week: inWeek }).eq("id", id);
    setRecettes((prev) => prev.map((r) => r.id === id ? { ...r, in_week: inWeek } : r));
  }

  return { recettes, loading, addRecette, deleteRecette, toggleWeek };
}
