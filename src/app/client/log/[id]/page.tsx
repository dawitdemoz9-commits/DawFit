import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WorkoutLogSession } from "@/components/client/workout-log-session";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function WorkoutLogSessionPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Load workout log with exercises and set logs
  const { data: log } = await supabase
    .from("workout_logs")
    .select("id, workout_id, status, logged_at, workouts(title, description)")
    .eq("id", id)
    .eq("client_id", user.id)
    .single();

  if (!log) notFound();
  if (log.status === "completed" || log.status === "skipped") redirect("/client/log");

  // Load exercise logs with set logs and exercise details
  const { data: exerciseLogs } = await supabase
    .from("exercise_logs")
    .select("id, exercise_id, order_index, notes, exercises(name, category)")
    .eq("workout_log_id", id)
    .order("order_index");

  const exerciseLogIds = (exerciseLogs ?? []).map(e => e.id);

  const { data: setLogs } = exerciseLogIds.length > 0
    ? await supabase
        .from("set_logs")
        .select("id, exercise_log_id, set_number, reps_completed, load, load_unit, rpe, completed")
        .in("exercise_log_id", exerciseLogIds)
        .order("set_number")
    : { data: [] };

  // Get prescribed values from workout_exercises for reference
  const { data: prescribedData } = log.workout_id ? await supabase
    .from("workout_exercises")
    .select("exercise_id, sets, reps, load, rest_seconds")
    .eq("workout_id", log.workout_id) : { data: [] };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const workout = log.workouts as unknown as { title: string; description: string | null } | null;

  // Build enriched exercise log data
  const enrichedExerciseLogs = (exerciseLogs ?? []).map(el => {
    const sets = (setLogs ?? []).filter(s => s.exercise_log_id === el.id);
    const prescribed = (prescribedData ?? []).find(p => p.exercise_id === el.exercise_id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exercise = el.exercises as unknown as { name: string; category: string | null } | null;
    return {
      id: el.id,
      exercise_id: el.exercise_id,
      order_index: el.order_index,
      notes: el.notes,
      exercise_name: exercise?.name ?? "Unknown",
      exercise_category: exercise?.category ?? null,
      prescribed_sets: prescribed?.sets ?? null,
      prescribed_reps: prescribed?.reps ?? null,
      prescribed_load: prescribed?.load ?? null,
      rest_seconds: prescribed?.rest_seconds ?? null,
      sets: sets.map(s => ({
        id: s.id,
        set_number: s.set_number,
        reps_completed: s.reps_completed,
        load: s.load,
        load_unit: s.load_unit ?? "lbs",
        rpe: s.rpe,
        completed: s.completed,
      })),
    };
  });

  return (
    <WorkoutLogSession
      logId={id}
      workoutTitle={workout?.title ?? "Workout"}
      workoutDescription={workout?.description ?? null}
      exerciseLogs={enrichedExerciseLogs}
    />
  );
}
