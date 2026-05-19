import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar, BottomNav } from "@/components/layout/Navbar";
import { AppProvider } from "@/components/providers/AppProvider";
import { AppShell } from "@/components/layout/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  // getSession reads from cookie — zero network call.
  // The proxy already validated + refreshed the JWT.
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) redirect("/login");

  return (
    <AppProvider userId={session.user.id}>
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
