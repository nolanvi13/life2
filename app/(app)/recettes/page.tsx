import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RecettesPage } from "@/components/recettes/RecettesPage";

export default async function Recettes() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("couple_id")
    .eq("id", user.id)
    .single();

  if (!profile?.couple_id) redirect("/settings");

  return <RecettesPage coupleId={profile.couple_id} />;
}
