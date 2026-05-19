import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar, BottomNav } from "@/components/layout/Navbar";
import { AppProvider } from "@/components/providers/AppProvider";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("profiles")
    .select("couple_id, display_name")
    .eq("id", user.id)
    .single();

  if (!me?.couple_id) redirect("/settings");

  // Fetch couple members once for the whole app
  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("id, display_name, created_at")
    .eq("couple_id", me.couple_id)
    .order("created_at", { ascending: true });

  const firstProfile = allProfiles?.[0];
  const secondProfile = allProfiles?.[1];
  const partnerProfile = allProfiles?.find((p) => p.id !== user.id) ?? null;

  const myOwner: "nolan" | "lylou" = firstProfile?.id === user.id ? "nolan" : "lylou";
  const nolanName = firstProfile?.display_name ?? "Membre 1";
  const lylouName = secondProfile?.display_name ?? "Membre 2";

  return (
    <AppProvider
      value={{
        coupleId: me.couple_id,
        userId: user.id,
        myName: me.display_name ?? null,
        partnerName: partnerProfile?.display_name ?? null,
        myOwner,
        nolanName,
        lylouName,
      }}
    >
      <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
        <Sidebar />
        <main className="flex-1 min-w-0 pb-20 md:pb-0">
          {children}
        </main>
        <BottomNav />
      </div>
    </AppProvider>
  );
}
