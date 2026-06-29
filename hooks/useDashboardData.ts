"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Evenement } from "./useCalendrier";
import { computeBalance, type Depense } from "@/lib/depenses";

type BudgetEntry = { owner: string; category: string; label: string; amount: number };

type DashboardBudget = {
  totalDepenses: number;
  totalRevenus: number;
  totalCommun: number;
};

type DashboardDepenses = {
  balance: number; // positive = myOwner owes partner | negative = partner owes myOwner
  totalAll: number;
};

/**
 * Fetch-once hook for dashboard summary data.
 * No realtime subscription — avoids duplicate channel conflicts
 * with BudgetPage (useBudget) and CalendrierPage (useCalendrier).
 */
export function useDashboardData(coupleId: string, myOwner: "nolan" | "lylou" = "nolan") {
  const supabase = useRef(createClient()).current;
  const [budget, setBudget] = useState<DashboardBudget | null>(null);
  const [depensesSummary, setDepensesSummary] = useState<DashboardDepenses | null>(null);
  const [nextEvent, setNextEvent] = useState<Evenement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!coupleId) return;
    let cancelled = false;

    async function load() {
      const today = new Date().toISOString().split("T")[0];

      const [budgetRes, eventRes, depensesRes] = await Promise.all([
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
        // Dépenses non réglées uniquement — indépendant du mois calendaire
        supabase
          .from("depenses")
          .select("amount, paid_by, split_type, custom_amount, created_at")
          .eq("couple_id", coupleId)
          .is("settled_at", null),
      ]);

      if (cancelled) return;

      // Budget summary
      const entries: BudgetEntry[] = budgetRes.data ?? [];
      let totalRevenus = 0;
      let totalDepenses = 0;
      let totalCommun = 0;
      for (const e of entries) {
        if (e.label === "salaire") totalRevenus += e.amount;
        else if (e.owner !== "commun") totalDepenses += e.amount;
        else { totalCommun += e.amount; totalDepenses += e.amount; }
      }

      // Dépenses non réglées
      const unsettled = (depensesRes.data ?? []) as Depense[];
      const balance = computeBalance(unsettled, myOwner);
      const totalAll = unsettled.reduce((s, d) => s + d.amount, 0);

      setBudget({ totalDepenses, totalRevenus, totalCommun });
      setDepensesSummary({ balance, totalAll });
      setNextEvent((eventRes.data as Evenement) ?? null);
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [coupleId, myOwner]); // eslint-disable-line react-hooks/exhaustive-deps

  return { budget, depensesSummary, nextEvent, loading };
}
