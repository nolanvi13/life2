"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type AppContextValue = {
  coupleId: string;          // "" while loading — hooks guard against this
  userId: string;
  myName: string | null;
  partnerName: string | null;
  myOwner: "nolan" | "lylou";
  nolanName: string;
  lylouName: string;
};

type ProfileRow = { id: string; display_name: string | null; created_at: string };

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ userId, children }: { userId: string; children: React.ReactNode }) {
  const router = useRouter();
  const [ctx, setCtx] = useState<AppContextValue>({
    coupleId: "",
    userId,
    myName: null,
    partnerName: null,
    myOwner: "nolan",
    nolanName: "...",
    lylouName: "...",
  });

  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();
    let cancelled = false;

    async function load() {
      // Step 1 — get own profile (includes couple_id)
      const { data: me } = await supabase
        .from("profiles")
        .select("couple_id, display_name")
        .eq("id", userId)
        .single();

      if (cancelled) return;

      if (!me?.couple_id) {
        router.replace("/settings");
        return;
      }

      // Provide coupleId ASAP so data hooks can start
      setCtx((prev) => ({
        ...prev,
        coupleId: me.couple_id,
        myName: me.display_name ?? null,
      }));

      // Step 2 — get member names (non-blocking for data hooks)
      const { data: members } = await supabase
        .from("profiles")
        .select("id, display_name, created_at")
        .eq("couple_id", me.couple_id)
        .order("created_at", { ascending: true });

      if (cancelled || !members) return;

      const rows = members as ProfileRow[];
      const first = rows[0];
      const second = rows[1];
      const partner = rows.find((p) => p.id !== userId) ?? null;

      setCtx((prev) => ({
        ...prev,
        partnerName: partner?.display_name ?? null,
        myOwner: first?.id === userId ? "nolan" : "lylou",
        nolanName: first?.display_name ?? "Membre 1",
        lylouName: second?.display_name ?? "Membre 2",
      }));
    }

    load();
    return () => { cancelled = true; };
  }, [userId, router]);

  // Always render children — never block on loading.
  // Hooks handle empty coupleId gracefully via their own guards.
  return <AppContext.Provider value={ctx}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
