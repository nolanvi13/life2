import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar, BottomNav } from "@/components/layout/Navbar";
import { AppProvider } from "@/components/providers/AppProvider";
import { AppShell } from "@/components/layout/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  // Fast: reads from cookie (session already validated by middleware)
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) redirect("/login");

  // Single DB query: just what we need for route protection
  const { data: profile } = await supabase
    .from("profiles")
    .select("couple_id")
    .eq("id", session.user.id)
    .single();

  if (!profile?.couple_id) redirect("/settings");

  return (
    <AppProvider userId={session.user.id} coupleId={profile.couple_id}>
      <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
        <Sidebar />
        <main className="flex-1 min-w-0 pb-20 md:pb-0">
          <AppShell>{children}</AppShell>
        </main>
        <BottomNav />
      </div>
    </AppProvider>
  );
}
