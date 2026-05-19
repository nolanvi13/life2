"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export type EventCategorie = "Rendez-vous" | "Sortie" | "Voyage" | "Famille" | "Santé" | "Autre";

export interface Evenement {
  id: string;
  couple_id: string;
  title: string;
  date: string;       // YYYY-MM-DD
  end_date?: string | null;
  time?: string | null; // HH:MM
  categorie: EventCategorie;
  note?: string | null;
  created_at: string;
}

export const CATEGORIE_COLORS: Record<EventCategorie, { bg: string; color: string; pastel: string }> = {
  "Rendez-vous": { bg: "var(--pastel-blue)",   color: "#1A5FA8", pastel: "var(--pastel-blue)" },
  "Sortie":      { bg: "var(--pastel-yellow)", color: "#8B6914", pastel: "var(--pastel-yellow)" },
  "Voyage":      { bg: "var(--pastel-peach)",  color: "#C2600A", pastel: "var(--pastel-peach)" },
  "Famille":     { bg: "var(--pastel-pink)",   color: "#BE185D", pastel: "var(--pastel-pink)" },
  "Santé":       { bg: "var(--pastel-green)",  color: "#15803D", pastel: "var(--pastel-green)" },
  "Autre":       { bg: "var(--surface-2)",     color: "var(--text-muted)", pastel: "var(--surface-2)" },
};

export const CATEGORIES: EventCategorie[] = ["Rendez-vous", "Sortie", "Voyage", "Famille", "Santé", "Autre"];

export function useCalendrier(coupleId: string) {
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useRef(createClient()).current;
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const load = useCallback(async () => {
    if (!coupleId) return;
    const { data } = await supabase
      .from("evenements")
      .select("*")
      .eq("couple_id", coupleId)
      .order("date", { ascending: true });
    if (data) setEvenements(data as Evenement[]);
    setLoading(false);
  }, [coupleId]);

  useEffect(() => {
    if (!coupleId) return;
    load();
    const channel = supabase
      .channel(`evenements:${coupleId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "evenements", filter: `couple_id=eq.${coupleId}` }, () => load())
      .subscribe();
    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [coupleId, load]);

  async function addEvenement(ev: Omit<Evenement, "id" | "couple_id" | "created_at">) {
    const { data, error } = await supabase.from("evenements").insert({ ...ev, couple_id: coupleId }).select().single();
    if (error) throw error;
    setEvenements((prev) => [...prev, data as Evenement].sort((a, b) => a.date.localeCompare(b.date)));
    return data as Evenement;
  }

  async function updateEvenement(id: string, ev: Partial<Omit<Evenement, "id" | "couple_id" | "created_at">>) {
    await supabase.from("evenements").update(ev).eq("id", id);
    setEvenements((prev) => prev.map((e) => e.id === id ? { ...e, ...ev } : e));
  }

  async function deleteEvenement(id: string) {
    await supabase.from("evenements").delete().eq("id", id);
    setEvenements((prev) => prev.filter((e) => e.id !== id));
  }

  return { evenements, loading, addEvenement, updateEvenement, deleteEvenement };
}
