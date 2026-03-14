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

export async function generateExercisesBulk(category: string, focus: string, count: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{
      role: "user",
      content: `Generate ${count} unique ${category} exercises${focus ? ` focused on ${focus}` : ""}.

Return ONLY a valid JSON array (no markdown, no explanation):
[
  {
    "name": "Exercise Name",
    "category": "${category}",
    "muscle_groups": ["muscle1", "muscle2"],
    "equipment": ["equipment1"],
    "description": "One sentence description"
  }
]`,
    }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "[]";
  let exercises: Array<{ name: string; category: string; muscle_groups: string[]; equipment: string[]; description?: string }>;
  try {
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
    exercises = JSON.parse(cleaned);
  } catch {
    return { error: "Failed to parse AI response" };
  }

  if (!Array.isArray(exercises) || exercises.length === 0) {
    return { error: "No exercises generated" };
  }

  const { data, error } = await supabase.from("exercises").insert(
    exercises.map((ex) => ({
      coach_id: user.id,
      name: ex.name,
      category: ex.category || category,
      muscle_groups: ex.muscle_groups || [],
      equipment: ex.equipment || [],
      description: ex.description || null,
      is_public: false,
    }))
  ).select();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/exercises");
  return { success: true, count: data?.length ?? 0 };
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
