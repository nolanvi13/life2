"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ItemCourse } from "@/lib/recettes";

export function useCourses(coupleId: string) {
  const [items, setItems] = useState<ItemCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useRef(createClient()).current;
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("items_courses")
      .select("*")
      .eq("couple_id", coupleId)
      .order("created_at", { ascending: true });
    if (data) setItems(data as ItemCourse[]);
    setLoading(false);
  }, [coupleId]);

  useEffect(() => {
    load();

    const channel = supabase
      .channel(`courses:${coupleId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "items_courses", filter: `couple_id=eq.${coupleId}` },
        () => load()
      )
      .subscribe();
    channelRef.current = channel;

    return () => { supabase.removeChannel(channel); };
  }, [coupleId, load]);

  async function addItem(item: {
    name: string;
    quantity?: string | null;
    unit?: string | null;
    category: string;
    recette_id?: string | null;
  }) {
    const { data, error } = await supabase
      .from("items_courses")
      .insert({ ...item, couple_id: coupleId, checked: false })
      .select()
      .single();
    if (error) throw error;
    setItems((prev) => [...prev, data as ItemCourse]);
    return data as ItemCourse;
  }

  async function addManyItems(rows: Array<{
    name: string;
    quantity?: string | null;
    unit?: string | null;
    category: string;
    recette_id?: string | null;
  }>) {
    const { error } = await supabase
      .from("items_courses")
      .insert(rows.map((r) => ({ ...r, couple_id: coupleId, checked: false })));
    if (error) throw error;
    await load();
  }

  async function toggleCheck(id: string, checked: boolean) {
    await supabase.from("items_courses").update({ checked }).eq("id", id);
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, checked } : i));
  }

  async function deleteItem(id: string) {
    await supabase.from("items_courses").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function clearChecked() {
    const ids = items.filter((i) => i.checked).map((i) => i.id);
    if (!ids.length) return;
    await supabase.from("items_courses").delete().in("id", ids);
    setItems((prev) => prev.filter((i) => !i.checked));
  }

  async function clearAll() {
    await supabase.from("items_courses").delete().eq("couple_id", coupleId);
    setItems([]);
  }

  async function updateItem(id: string, fields: { name?: string; quantity?: string | null; unit?: string | null; category?: string }) {
    await supabase.from("items_courses").update(fields).eq("id", id);
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, ...fields } : i));
  }

  async function removeByRecette(recetteId: string) {
    await supabase.from("items_courses").delete().eq("recette_id", recetteId).eq("couple_id", coupleId);
    setItems((prev) => prev.filter((i) => i.recette_id !== recetteId));
  }

  return { items, loading, addItem, addManyItems, toggleCheck, deleteItem, updateItem, clearChecked, clearAll, removeByRecette };
}
