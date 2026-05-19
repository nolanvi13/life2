import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CoursesPage } from "@/components/courses/CoursesPage";

export default async function Courses() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("couple_id")
    .eq("id", user.id)
    .single();

  if (!profile?.couple_id) redirect("/settings");

  return <CoursesPage coupleId={profile.couple_id} />;
}
