"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useDepensesArchives(coupleId: string) {
  const supabase = useRef(createClient()).current;
  const [archivedMonths, setArchivedMonths] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    if (!coupleId) return;
    const { data } = await supabase
      .from("depenses_archives")
      .select("year_month")
      .eq("couple_id", coupleId);
    setArchivedMonths(new Set((data ?? []).map((r: { year_month: string }) => r.year_month)));
  }, [coupleId, supabase]);

  useEffect(() => {
    if (!coupleId) return;
    load();
    const channel = supabase
      .channel(`depenses_archives:${coupleId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "depenses_archives", filter: `couple_id=eq.${coupleId}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [coupleId, load, supabase]);

  async function archiveMonth(yearMonth: string) {
    const { error } = await supabase
      .from("depenses_archives")
      .insert({ couple_id: coupleId, year_month: yearMonth });
    if (error) { console.error("[useDepensesArchives] archiveMonth:", error); return false; }
    setArchivedMonths((prev) => new Set([...prev, yearMonth]));
    return true;
  }

  async function unarchiveMonth(yearMonth: string) {
    await supabase
      .from("depenses_archives")
      .delete()
      .eq("couple_id", coupleId)
      .eq("year_month", yearMonth);
    setArchivedMonths((prev) => {
      const next = new Set(prev);
      next.delete(yearMonth);
      return next;
    });
  }

  return { archivedMonths, archiveMonth, unarchiveMonth };
}
