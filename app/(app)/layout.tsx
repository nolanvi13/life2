import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar, BottomNav } from "@/components/layout/Navbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      <Sidebar />
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
