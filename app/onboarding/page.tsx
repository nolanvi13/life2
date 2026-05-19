import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OnboardingClient from "./OnboardingClient";

export default async function OnboardingPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("couple_id, display_name")
    .eq("id", user.id)
    .single();

  if (!profile?.couple_id) redirect("/login");

  const { data: couple } = await supabase
    .from("couples")
    .select("invite_code")
    .eq("id", profile.couple_id)
    .single();

  if (!couple) redirect("/login");

  return (
    <OnboardingClient
      inviteCode={couple.invite_code}
      displayName={profile.display_name ?? ""}
    />
  );
}
