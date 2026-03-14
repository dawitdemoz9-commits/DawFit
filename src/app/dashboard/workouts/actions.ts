"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createWorkout(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase.from("workouts").insert({
    coach_id: user.id,
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    estimated_duration_min: formData.get("estimated_duration_min")
      ? Number(formData.get("estimated_duration_min"))
      : null,
    status: "draft",
    is_template: formData.get("is_template") === "true",
  }).select().single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/workouts");
  redirect(`/dashboard/workouts/${data.id}`);
}

export async function updateWorkoutMeta(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("workouts").update({
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    estimated_duration_min: formData.get("estimated_duration_min")
      ? Number(formData.get("estimated_duration_min"))
      : null,
    status: formData.get("status") as "draft" | "published",
  }).eq("id", id).eq("coach_id", user.id);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/workouts/${id}`);
  revalidatePath("/dashboard/workouts");
  return { success: true };
}

export async function addExerciseToWorkout(workoutId: string, exerciseId: string, orderIndex: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Verify ownership
  const { data: workout } = await supabase
    .from("workouts").select("id").eq("id", workoutId).eq("coach_id", user.id).single();
  if (!workout) return { error: "Not found" };

  const { data, error } = await supabase.from("workout_exercises").insert({
    workout_id: workoutId,
    exercise_id: exerciseId,
    order_index: orderIndex,
    sets: 3,
    reps: "8-10",
    rest_seconds: 90,
  }).select().single();

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/workouts/${workoutId}`);
  return { data };
}

export async function updateWorkoutExercise(
  id: string,
  fields: { sets?: number; reps?: string; load?: string; rest_seconds?: number; tempo?: string; notes?: string }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Verify ownership via workout join
  const { data: we } = await supabase
    .from("workout_exercises")
    .select("workout_id, workouts(coach_id)")
    .eq("id", id)
    .single();

  const workout = Array.isArray(we?.workouts) ? we.workouts[0] : we?.workouts;
  if (!we || workout?.coach_id !== user.id) return { error: "Not found" };

  const { error } = await supabase.from("workout_exercises").update(fields).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(`/dashboard/workouts/${we.workout_id}`);
  return { success: true };
}

export async function removeExerciseFromWorkout(workoutExerciseId: string, workoutId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("workout_exercises")
    .delete()
    .eq("id", workoutExerciseId);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/workouts/${workoutId}`);
  return { success: true };
}

export async function reorderWorkoutExercises(workoutId: string, orderedIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const updates = orderedIds.map((id, index) =>
    supabase.from("workout_exercises").update({ order_index: index }).eq("id", id)
  );
  await Promise.all(updates);

  revalidatePath(`/dashboard/workouts/${workoutId}`);
  return { success: true };
}

export async function createExerciseQuick(name: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("exercises")
    .insert({ coach_id: user.id, name, is_public: false })
    .select("id, name, category, muscle_groups")
    .single();

  if (data) revalidatePath("/dashboard/exercises");
  return data;
}

export async function deleteWorkout(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("workouts").delete().eq("id", id).eq("coach_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/workouts");
  redirect("/dashboard/workouts");
}
