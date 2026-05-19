"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Evenement } from "./useCalendrier";

type BudgetEntry = { owner: string; category: string; label: string; amount: number };

type DashboardBudget = {
  totalDepenses: number;
  totalRevenus: number;
  totalCommun: number;
};

/**
 * Fetch-once hook for dashboard summary data.
 * No realtime subscription — avoids duplicate channel conflicts
 * with BudgetPage (useBudget) and CalendrierPage (useCalendrier).
 */
export function useDashboardData(coupleId: string) {
  const supabase = useRef(createClient()).current;
  const [budget, setBudget] = useState<DashboardBudget | null>(null);
  const [nextEvent, setNextEvent] = useState<Evenement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!coupleId) return;
    let cancelled = false;

    async function load() {
      const today = new Date().toISOString().split("T")[0];

      const [budgetRes, eventRes] = await Promise.all([
        supabase
          .from("budget_entries")
          .select("owner, category, label, amount")
          .eq("couple_id", coupleId),
        supabase
          .from("evenements")
          .select("*")
          .eq("couple_id", coupleId)
          .gte("date", today)
          .order("date", { ascending: true })
          .limit(1)
          .single(),
      ]);

      if (cancelled) return;

      // Compute budget summary
      const entries: BudgetEntry[] = budgetRes.data ?? [];
      let totalRevenus = 0;
      let totalDepenses = 0;
      let totalCommun = 0;

      for (const e of entries) {
        if (e.label === "salaire") {
          totalRevenus += e.amount;
        } else if (e.owner !== "commun") {
          totalDepenses += e.amount;
        } else {
          totalCommun += e.amount;
          totalDepenses += e.amount;
        }
      }

      setBudget({ totalDepenses, totalRevenus, totalCommun });
      setNextEvent((eventRes.data as Evenement) ?? null);
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [coupleId]); // eslint-disable-line react-hooks/exhaustive-deps

  return { budget, nextEvent, loading };
}
