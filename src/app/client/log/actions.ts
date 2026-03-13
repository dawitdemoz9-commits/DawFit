"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function startWorkoutLog(workoutId: string, assignmentId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: client } = await supabase
    .from("clients")
    .select("coach_id")
    .eq("id", user.id)
    .single();
  if (!client) throw new Error("Client record not found");

  // Check for existing in-progress log for this workout today
  const today = new Date().toISOString().split("T")[0];
  const { data: existing } = await supabase
    .from("workout_logs")
    .select("id")
    .eq("client_id", user.id)
    .eq("workout_id", workoutId)
    .eq("status", "in_progress")
    .gte("logged_at", today)
    .maybeSingle();

  if (existing) return existing.id;

  // Load workout exercises to pre-populate exercise_logs
  const { data: workoutExercises } = await supabase
    .from("workout_exercises")
    .select("id, exercise_id, sets, reps, load, order_index")
    .eq("workout_id", workoutId)
    .order("order_index");

  const { data: log, error } = await supabase
    .from("workout_logs")
    .insert({
      client_id: user.id,
      coach_id: client.coach_id,
      workout_id: workoutId,
      assignment_id: assignmentId ?? null,
      status: "in_progress",
    })
    .select("id")
    .single();

  if (error || !log) throw new Error(error?.message ?? "Failed to create workout log");

  // Pre-populate exercise_logs
  if (workoutExercises && workoutExercises.length > 0) {
    const exerciseLogs = workoutExercises.map((we, idx) => ({
      workout_log_id: log.id,
      exercise_id: we.exercise_id,
      workout_exercise_id: we.id,
      order_index: idx,
    }));
    const { data: insertedLogs } = await supabase
      .from("exercise_logs")
      .insert(exerciseLogs)
      .select("id, workout_exercise_id");

    // Pre-populate set_logs based on prescribed sets
    if (insertedLogs && insertedLogs.length > 0) {
      const setLogsToInsert = [];
      for (const exLog of insertedLogs) {
        const we = workoutExercises.find(w => w.id === exLog.workout_exercise_id);
        const numSets = we?.sets ?? 3;
        for (let s = 1; s <= numSets; s++) {
          setLogsToInsert.push({
            exercise_log_id: exLog.id,
            set_number: s,
            completed: false,
          });
        }
      }
      await supabase.from("set_logs").insert(setLogsToInsert);
    }
  }

  return log.id;
}

export async function updateSetLog(
  setLogId: string,
  data: { reps_completed?: number | null; load?: number | null; load_unit?: string; rpe?: number | null; completed?: boolean }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  await supabase.from("set_logs").update(data).eq("id", setLogId);
}

export async function addSetToExerciseLog(exerciseLogId: string, setNumber: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data } = await supabase
    .from("set_logs")
    .insert({ exercise_log_id: exerciseLogId, set_number: setNumber, completed: false })
    .select("id, set_number, reps_completed, load, load_unit, rpe, completed")
    .single();
  return data;
}

export async function completeWorkoutLog(
  logId: string,
  data: { duration_min?: number; overall_rpe?: number; energy_level?: number; notes?: string }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  await supabase
    .from("workout_logs")
    .update({ status: "completed", ...data })
    .eq("id", logId)
    .eq("client_id", user.id);

  revalidatePath("/client");
  revalidatePath("/client/log");
  redirect("/client");
}

export async function skipWorkoutLog(logId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  await supabase
    .from("workout_logs")
    .update({ status: "skipped" })
    .eq("id", logId)
    .eq("client_id", user.id);

  revalidatePath("/client");
  redirect("/client");
}
