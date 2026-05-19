"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateDisplayName(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté" };

  const displayName = formData.get("display_name") as string;
  if (!displayName?.trim()) return { error: "Le prénom ne peut pas être vide" };

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName.trim() })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function createCouple() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté" };

  const { data: couple, error } = await supabase
    .from("couples")
    .insert({})
    .select()
    .single();

  if (error || !couple) return { error: "Erreur lors de la création du couple." };

  await supabase
    .from("profiles")
    .update({ couple_id: couple.id })
    .eq("id", user.id);

  revalidatePath("/settings");
  return { success: true, inviteCode: couple.invite_code };
}

export async function joinCouple(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté" };

  const inviteCode = (formData.get("invite_code") as string)?.trim().toLowerCase();
  if (!inviteCode) return { error: "Code requis" };

  const { data: couple, error } = await supabase
    .from("couples")
    .select("id")
    .eq("invite_code", inviteCode)
    .single();

  if (error || !couple) return { error: "Code d'invitation invalide." };

  await supabase
    .from("profiles")
    .update({ couple_id: couple.id })
    .eq("id", user.id);

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}
