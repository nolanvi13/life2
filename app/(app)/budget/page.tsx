import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BudgetPage } from "@/components/budget/BudgetPage";

export default async function Budget() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("couple_id, display_name")
    .eq("id", user.id)
    .single();

  if (!profile?.couple_id) redirect("/settings");

  // Fetch all couple members ordered by creation date
  // First member = owner 'nolan', second member = owner 'lylou'
  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("id, display_name, created_at")
    .eq("couple_id", profile.couple_id)
    .order("created_at", { ascending: true });

  const firstProfile = allProfiles?.[0];
  const secondProfile = allProfiles?.[1];

  const nolanName = firstProfile?.display_name ?? "Membre 1";
  const lylouName = secondProfile?.display_name ?? "Membre 2";

  // Tell the page which owner the current user corresponds to
  const myOwner = firstProfile?.id === user.id ? "nolan" : "lylou";

  return (
    <BudgetPage
      coupleId={profile.couple_id}
      nolanName={nolanName}
      lylouName={lylouName}
      myOwner={myOwner}
    />
  );
}
