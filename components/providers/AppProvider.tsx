"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type AppContextValue = {
  coupleId: string;
  userId: string;
  myName: string | null;
  partnerName: string | null;
  myOwner: "nolan" | "lylou";
  nolanName: string;
  lylouName: string;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({
  userId,
  coupleId,
  children,
}: {
  userId: string;
  coupleId: string;
  children: React.ReactNode;
}) {
  // coupleId and userId are immediately available (from server).
  // Member names are fetched client-side once and cached in state.
  const [ctx, setCtx] = useState<AppContextValue>({
    coupleId,
    userId,
    myName: null,
    partnerName: null,
    myOwner: "nolan",
    nolanName: "Membre 1",
    lylouName: "Membre 2",
  });

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("id, display_name, created_at")
      .eq("couple_id", coupleId)
      .order("created_at", { ascending: true })
      .then(({ data }: { data: { id: string; display_name: string | null; created_at: string }[] | null }) => {
        if (!data) return;
        const first = data[0];
        const second = data[1];
        const partner = data.find((p: { id: string }) => p.id !== userId) ?? null;
        const me = data.find((p: { id: string }) => p.id === userId) ?? null;
        setCtx({
          coupleId,
          userId,
          myName: me?.display_name ?? null,
          partnerName: partner?.display_name ?? null,
          myOwner: first?.id === userId ? "nolan" : "lylou",
          nolanName: first?.display_name ?? "Membre 1",
          lylouName: second?.display_name ?? "Membre 2",
        });
      });
  }, [userId, coupleId]);

  return <AppContext.Provider value={ctx}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
