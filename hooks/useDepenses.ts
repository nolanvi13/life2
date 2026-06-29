"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Depense } from "@/lib/depenses";

export function useDepenses(coupleId: string) {
  const supabase = useRef(createClient()).current;
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!coupleId) return;
    const { data } = await supabase
      .from("depenses")
      .select("*")
      .eq("couple_id", coupleId)
      .order("created_at", { ascending: false });
    setDepenses((data ?? []) as Depense[]);
    setLoading(false);
  }, [coupleId, supabase]);

  useEffect(() => {
    if (!coupleId) return;

    load();

    const channel = supabase
      .channel(`depenses:${coupleId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "depenses", filter: `couple_id=eq.${coupleId}` },
        () => load()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [coupleId, load, supabase]);

  async function addDepense(payload: Omit<Depense, "id" | "couple_id" | "created_at">) {
    await supabase.from("depenses").insert({ ...payload, couple_id: coupleId });
  }

  async function updateDepense(id: string, payload: Omit<Depense, "id" | "couple_id" | "created_at">) {
    await supabase.from("depenses").update(payload).eq("id", id);
  }

  async function deleteDepense(id: string) {
    const { error, count } = await supabase
      .from("depenses")
      .delete({ count: "exact" })
      .eq("id", id);
    if (error) console.error("deleteDepense error:", error);
    else if (count === 0) console.warn("deleteDepense: 0 rows deleted (RLS?)");
    else load(); // forcer le refresh si realtime ne réagit pas
  }

  async function deleteAll(ids: string[]) {
    if (ids.length === 0) return;
    const { error } = await supabase.from("depenses").delete().in("id", ids);
    if (error) console.error("deleteAll error:", error);
    else load();
  }

  async function markSettled(ids: string[]) {
    if (ids.length === 0) return;
    const { error } = await supabase
      .from("depenses")
      .update({ settled_at: new Date().toISOString() })
      .in("id", ids);
    if (error) console.error("markSettled error:", error);
    else load();
  }

  return { depenses, loading, addDepense, updateDepense, deleteDepense, deleteAll, markSettled };
}
