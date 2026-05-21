"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Note } from "@/lib/notes";

export function useNotes(coupleId: string, myOwner: string) {
  const supabase = useRef(createClient()).current;
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!coupleId) return;
    const { data } = await supabase
      .from("notes")
      .select("*")
      .eq("couple_id", coupleId)
      .order("updated_at", { ascending: false });
    setNotes((data ?? []) as Note[]);
    setLoading(false);
  }, [coupleId, supabase]);

  useEffect(() => {
    if (!coupleId) return;
    load();
    const channel = supabase
      .channel(`notes:${coupleId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notes", filter: `couple_id=eq.${coupleId}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [coupleId, load, supabase]);

  async function createNote(): Promise<Note | null> {
    const { data, error } = await supabase
      .from("notes")
      .insert({ couple_id: coupleId, title: "", content: "", created_by: myOwner })
      .select()
      .single();
    if (error) { console.error("[useNotes] createNote error:", error); return null; }
    const note = data as Note;
    // Ajoute immédiatement à la liste locale sans attendre le realtime
    setNotes((prev) => [note, ...prev]);
    return note;
  }

  async function updateNote(id: string, fields: Partial<Pick<Note, "title" | "content">>) {
    // Mise à jour optimiste de la liste locale (preview + date)
    const now = new Date().toISOString();
    setNotes((prev) =>
      prev
        .map((n) => (n.id === id ? { ...n, ...fields, updated_at: now } : n))
        .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    );

    const { error, count } = await supabase
      .from("notes")
      .update({ ...fields, updated_at: now }, { count: "exact" })
      .eq("id", id);
    if (error) {
      console.error("[useNotes] updateNote error:", error);
      throw error;
    }
    if (count === 0) {
      console.warn("[useNotes] updateNote: 0 rows updated — RLS block ou id introuvable?");
      throw new Error("0 rows updated");
    }
  }

  async function deleteNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await supabase.from("notes").delete().eq("id", id);
  }

  return { notes, loading, createNote, updateNote, deleteNote };
}
