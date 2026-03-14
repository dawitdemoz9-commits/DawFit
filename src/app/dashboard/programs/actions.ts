"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createProgram(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const durationWeeks = Number(formData.get("duration_weeks"));

  const { data: program, error } = await supabase.from("programs").insert({
    coach_id: user.id,
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    duration_weeks: durationWeeks || null,
    status: "draft",
    is_template: formData.get("is_template") === "true",
  }).select().single();

  if (error) return { error: error.message };

  // Auto-create week stubs
  if (durationWeeks > 0) {
    const weekInserts = Array.from({ length: durationWeeks }, (_, i) => ({
      program_id: program.id,
      week_number: i + 1,
      label: `Week ${i + 1}`,
    }));
    await supabase.from("weeks").insert(weekInserts);
  }

  revalidatePath("/dashboard/programs");
  redirect(`/dashboard/programs/${program.id}`);
}

export async function updateProgram(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("programs").update({
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    status: formData.get("status") as "draft" | "active" | "archived",
  }).eq("id", id).eq("coach_id", user.id);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/programs/${id}`);
  revalidatePath("/dashboard/programs");
  return { success: true };
}

export async function addWeekToProgram(programId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Get current max week number
  const { data: existingWeeks } = await supabase
    .from("weeks")
    .select("week_number")
    .eq("program_id", programId)
    .order("week_number", { ascending: false })
    .limit(1);

  const nextWeek = (existingWeeks?.[0]?.week_number ?? 0) + 1;

  const { data, error } = await supabase.from("weeks").insert({
    program_id: programId,
    week_number: nextWeek,
    label: `Week ${nextWeek}`,
  }).select().single();

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/programs/${programId}`);
  return { data };
}

export async function updateWeek(weekId: string, programId: string, fields: { label?: string; notes?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("weeks").update(fields).eq("id", weekId);
  if (error) return { error: error.message };

  revalidatePath(`/dashboard/programs/${programId}`);
  return { success: true };
}

export async function deleteWeek(weekId: string, programId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("weeks").delete().eq("id", weekId);
  if (error) return { error: error.message };

  revalidatePath(`/dashboard/programs/${programId}`);
  return { success: true };
}

export async function addWorkoutToWeek(weekId: string, programId: string, title: string, dayOfWeek?: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Count existing workouts in week for order_index
  const { count } = await supabase
    .from("workouts")
    .select("*", { count: "exact", head: true })
    .eq("week_id", weekId);

  const { data, error } = await supabase.from("workouts").insert({
    coach_id: user.id,
    week_id: weekId,
    title,
    day_of_week: dayOfWeek ?? null,
    order_index: count ?? 0,
    status: "draft",
  }).select().single();

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/programs/${programId}`);
  return { data };
}

export async function removeWorkoutFromWeek(workoutId: string, programId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("workouts")
    .delete()
    .eq("id", workoutId)
    .eq("coach_id", user.id);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/programs/${programId}`);
  return { success: true };
}

export async function assignProgram(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const programId = formData.get("program_id") as string;
  const clientId = formData.get("client_id") as string;
  const startDate = formData.get("start_date") as string;

  // Verify program ownership
  const { data: program } = await supabase
    .from("programs")
    .select("id, duration_weeks")
    .eq("id", programId)
    .eq("coach_id", user.id)
    .single();

  if (!program) return { error: "Program not found" };

  // Verify client belongs to this coach
  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("id", clientId)
    .eq("coach_id", user.id)
    .single();

  if (!client) return { error: "Client not found" };

  // Deactivate any existing active assignments for this client
  await supabase
    .from("program_assignments")
    .update({ status: "paused" })
    .eq("client_id", clientId)
    .eq("status", "active");

  // Calculate end date
  let endDate: string | null = null;
  if (program.duration_weeks) {
    const end = new Date(startDate);
    end.setDate(end.getDate() + program.duration_weeks * 7);
    endDate = end.toISOString().split("T")[0];
  }

  const { error } = await supabase.from("program_assignments").insert({
    program_id: programId,
    client_id: clientId,
    coach_id: user.id,
    start_date: startDate,
    end_date: endDate,
    status: "active",
  });

  if (error) return { error: error.message };

  // Activate the program if it was draft
  await supabase.from("programs").update({ status: "active" }).eq("id", programId).eq("status", "draft");

  revalidatePath(`/dashboard/programs/${programId}`);
  revalidatePath(`/dashboard/clients/${clientId}`);
  return { success: true };
}

export async function copyWorkoutToWeek(workoutId: string, weekId: string, programId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: source } = await supabase
    .from("workouts")
    .select("*, workout_exercises(*)")
    .eq("id", workoutId)
    .eq("coach_id", user.id)
    .single();

  if (!source) return { error: "Workout not found" };

  const { count } = await supabase
    .from("workouts")
    .select("*", { count: "exact", head: true })
    .eq("week_id", weekId);

  const { data: copy, error } = await supabase.from("workouts").insert({
    coach_id: user.id,
    week_id: weekId,
    title: source.title,
    description: source.description,
    day_of_week: source.day_of_week,
    order_index: count ?? 0,
    estimated_duration_min: source.estimated_duration_min,
    status: "draft",
    is_template: false,
  }).select().single();

  if (error || !copy) return { error: error?.message ?? "Failed to copy" };

  const srcExercises = Array.isArray(source.workout_exercises) ? source.workout_exercises : [];
  if (srcExercises.length > 0) {
    await supabase.from("workout_exercises").insert(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      srcExercises.map((ex: any) => ({
        workout_id: copy.id,
        exercise_id: ex.exercise_id,
        order_index: ex.order_index,
        sets: ex.sets,
        reps: ex.reps,
        load: ex.load,
        rest_seconds: ex.rest_seconds,
        tempo: ex.tempo,
        notes: ex.notes,
      }))
    );
  }

  revalidatePath(`/dashboard/programs/${programId}`);
  return { data: copy };
}

export async function deleteProgram(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("programs").delete().eq("id", id).eq("coach_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/programs");
  redirect("/dashboard/programs");
}
