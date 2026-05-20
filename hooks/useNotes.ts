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
    if (error) { console.error(error); return null; }
    return data as Note;
  }

  async function updateNote(id: string, fields: Partial<Pick<Note, "title" | "content">>) {
    await supabase
      .from("notes")
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq("id", id);
  }

  async function deleteNote(id: string) {
    await supabase.from("notes").delete().eq("id", id);
    load();
  }

  return { notes, loading, createNote, updateNote, deleteNote };
}
