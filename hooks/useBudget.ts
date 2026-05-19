"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { BudgetOwner, BudgetValues } from "@/lib/budget";

type Entry = {
  id: string;
  owner: string;
  category: string;
  label: string;
  amount: number;
};

type UseBudgetReturn = {
  nolan: BudgetValues;
  lylou: BudgetValues;
  commun: BudgetValues;
  loading: boolean;
  updateField: (owner: BudgetOwner, category: string, key: string, value: number) => void;
};

export function useBudget(coupleId: string): UseBudgetReturn {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const idMap = useRef<Map<string, string>>(new Map());
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("budget_entries")
        .select("id, owner, category, label, amount")
        .eq("couple_id", coupleId);

      if (data) {
        setEntries(data);
        data.forEach((e: Entry) => idMap.current.set(`${e.owner}_${e.label}`, e.id));
      }
      setLoading(false);
    }

    load();

    const channel = supabase
      .channel(`budget_${coupleId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "budget_entries", filter: `couple_id=eq.${coupleId}` },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const e = payload.new as Entry;
            idMap.current.set(`${e.owner}_${e.label}`, e.id);
            setEntries((prev) => {
              const idx = prev.findIndex((x) => x.id === e.id);
              if (idx >= 0) { const next = [...prev]; next[idx] = e; return next; }
              return [...prev, e];
            });
          }
          if (payload.eventType === "DELETE") {
            setEntries((prev) => prev.filter((x) => x.id !== (payload.old as Entry).id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [coupleId]); // eslint-disable-line react-hooks/exhaustive-deps

  const nolan: BudgetValues = {};
  const lylou: BudgetValues = {};
  const commun: BudgetValues = {};

  entries.forEach((e) => {
    if (e.owner === "nolan") nolan[e.label] = e.amount;
    else if (e.owner === "lylou") lylou[e.label] = e.amount;
    else if (e.owner === "commun") commun[e.label] = e.amount;
  });

  function updateField(owner: BudgetOwner, category: string, key: string, value: number) {
    const mapKey = `${owner}_${key}`;
    const existingId = idMap.current.get(mapKey);

    // Optimistic update
    if (existingId) {
      setEntries((prev) => prev.map((e) => e.id === existingId ? { ...e, amount: value } : e));
    }

    if (existingId) {
      supabase
        .from("budget_entries")
        .update({ amount: value })
        .eq("id", existingId)
        .then(() => {});
    } else {
      supabase
        .from("budget_entries")
        .insert({ couple_id: coupleId, owner, category, label: key, amount: value })
        .select("id, owner, category, label, amount")
        .single()
        .then(({ data }) => {
          if (data) {
            idMap.current.set(mapKey, data.id);
            setEntries((prev) => [...prev, data]);
          }
        });
    }
  }

  return { nolan, lylou, commun, loading, updateField };
}
