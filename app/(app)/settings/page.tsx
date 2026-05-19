import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const supabase = await createClient();
  // getSession reads from cookie — zero network call.
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) redirect("/login");

  // Pass only what's in the session (no DB queries).
  // Profile data and invite code are fetched client-side via AppProvider / SettingsClient.
  return <SettingsClient email={session.user.email ?? ""} />;
}
