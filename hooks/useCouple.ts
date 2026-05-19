"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  couple_id: string;
  display_name: string | null;
  color: string | null;
};

type CoupleData = {
  coupleId: string | null;
  me: Profile | null;
  partner: Profile | null;
  inviteCode: string | null;
  loading: boolean;
};

export function useCouple(): CoupleData {
  const [data, setData] = useState<CoupleData>({
    coupleId: null,
    me: null,
    partner: null,
    inviteCode: null,
    loading: true,
  });

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setData((d) => ({ ...d, loading: false }));
        return;
      }

      const { data: me } = await supabase
        .from("profiles")
        .select("id, couple_id, display_name, color")
        .eq("id", user.id)
        .single();

      if (!me?.couple_id) {
        setData((d) => ({ ...d, me: me ?? null, loading: false }));
        return;
      }

      const [{ data: profiles }, { data: couple }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, couple_id, display_name, color")
          .eq("couple_id", me.couple_id),
        supabase
          .from("couples")
          .select("invite_code")
          .eq("id", me.couple_id)
          .single(),
      ]);

      const partner = profiles?.find((p) => p.id !== user.id) ?? null;

      setData({
        coupleId: me.couple_id,
        me,
        partner,
        inviteCode: couple?.invite_code ?? null,
        loading: false,
      });
    }

    load();
  }, []);

  return data;
}
