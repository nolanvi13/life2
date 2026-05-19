"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };

  redirect("/dashboard");
}

export async function register(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const displayName = formData.get("display_name") as string;
  const inviteCode = (formData.get("invite_code") as string)?.trim();

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) return { error: signUpError.message };
  if (!authData.user) return { error: "Erreur lors de la création du compte." };

  const userId = authData.user.id;

  // Update profile display name
  await supabase
    .from("profiles")
    .update({ display_name: displayName })
    .eq("id", userId);

  if (inviteCode) {
    // Join existing couple
    const { data: couple, error: coupleError } = await supabase
      .from("couples")
      .select("id")
      .eq("invite_code", inviteCode)
      .single();

    if (coupleError || !couple) {
      return { error: "Code d'invitation invalide." };
    }

    await supabase
      .from("profiles")
      .update({ couple_id: couple.id })
      .eq("id", userId);

    redirect("/dashboard");
  } else {
    // Create new couple
    const { data: couple, error: createError } = await supabase
      .from("couples")
      .insert({})
      .select()
      .single();

    if (createError || !couple) {
      return { error: "Erreur lors de la création du couple." };
    }

    await supabase
      .from("profiles")
      .update({ couple_id: couple.id })
      .eq("id", userId);

    redirect("/onboarding");
  }
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
