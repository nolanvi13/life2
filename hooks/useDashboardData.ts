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
      const now = new Date();
      const thisYear = now.getFullYear();
      const thisMonth = now.getMonth();

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
        // Fetch all depenses — filter by month in JS to avoid timestamptz comparison issues
        supabase
          .from("depenses")
          .select("amount, paid_by, split_type, created_at")
          .eq("couple_id", coupleId),
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

      // Depenses — filter current month in JS
      const allDepenses = depensesRes.data ?? [];
      const thisMonthDepenses = allDepenses.filter((d: { created_at: string }) => {
        const date = new Date(d.created_at);
        return date.getFullYear() === thisYear && date.getMonth() === thisMonth;
      });

      const partnerOwner = myOwner === "nolan" ? "lylou" : "nolan";
      let balance = 0;
      let totalAll = 0;
      for (const d of thisMonthDepenses) {
        totalAll += d.amount;
        const splitType = d.split_type ?? "half";
        const owed = splitType === "half" ? d.amount / 2 : splitType === "full" ? d.amount : 0;
        if (owed === 0) continue;
        if (d.paid_by === partnerOwner) balance += owed;
        else balance -= owed;
      }

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
