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
  "Rendez-vous": { bg: "#E4EBF0", color: "#3D6B88", pastel: "#E4EBF0" },
  "Sortie":      { bg: "#F5E9DC", color: "#C4614A", pastel: "#F5E9DC" },
  "Voyage":      { bg: "#EBF0E8", color: "#2C4A35", pastel: "#EBF0E8" },
  "Famille":     { bg: "#EEE4F0", color: "#7A60A0", pastel: "#EEE4F0" },
  "Santé":       { bg: "#E4F0EA", color: "#2D6B45", pastel: "#E4F0EA" },
  "Autre":       { bg: "#F7F3EC", color: "#7A8A7E", pastel: "#F7F3EC" },
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
