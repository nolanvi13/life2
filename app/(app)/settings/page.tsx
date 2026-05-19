import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, couple_id")
    .eq("id", user.id)
    .single();

  const { data: couple } = profile?.couple_id
    ? await supabase.from("couples").select("invite_code").eq("id", profile.couple_id).single()
    : { data: null };

  return (
    <SettingsClient
      email={user.email ?? ""}
      displayName={profile?.display_name ?? ""}
      inviteCode={couple?.invite_code ?? null}
    />
  );
}
