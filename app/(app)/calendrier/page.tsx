import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CalendrierPage } from "@/components/calendrier/CalendrierPage";

export default async function Calendrier() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("couple_id")
    .eq("id", user.id)
    .single();

  if (!profile?.couple_id) redirect("/settings");

  return <CalendrierPage coupleId={profile.couple_id} />;
}
