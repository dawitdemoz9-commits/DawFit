"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createExercise(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const muscleGroups = formData.getAll("muscle_groups") as string[];
  const equipment = formData.getAll("equipment") as string[];

  const { data, error } = await supabase.from("exercises").insert({
    coach_id: user.id,
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    instructions: (formData.get("instructions") as string) || null,
    category: (formData.get("category") as string) || null,
    muscle_groups: muscleGroups.filter(Boolean),
    equipment: equipment.filter(Boolean),
    video_url: (formData.get("video_url") as string) || null,
    is_public: formData.get("is_public") === "true",
  }).select().single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/exercises");
  redirect(`/dashboard/exercises/${data.id}`);
}

export async function updateExercise(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const muscleGroups = formData.getAll("muscle_groups") as string[];
  const equipment = formData.getAll("equipment") as string[];

  const { error } = await supabase.from("exercises").update({
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    instructions: (formData.get("instructions") as string) || null,
    category: (formData.get("category") as string) || null,
    muscle_groups: muscleGroups.filter(Boolean),
    equipment: equipment.filter(Boolean),
    video_url: (formData.get("video_url") as string) || null,
    is_public: formData.get("is_public") === "true",
  }).eq("id", id).eq("coach_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/exercises");
  revalidatePath(`/dashboard/exercises/${id}`);
  return { success: true };
}

export async function deleteExercise(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("exercises")
    .delete()
    .eq("id", id)
    .eq("coach_id", user.id); // RLS + explicit guard

  if (error) return { error: error.message };

  revalidatePath("/dashboard/exercises");
  redirect("/dashboard/exercises");
}
