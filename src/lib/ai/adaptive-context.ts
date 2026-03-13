import { createClient } from "@/lib/supabase/server";

export interface AdaptiveAnalysisContext {
  coach: {
    id: string;
    exercise_library: Array<{ id: string; name: string; category: string | null; muscle_groups: string[] | null }>;
  };
  client: {
    id: string;
    name: string | null;
    goals: string | null;
  };
  program: {
    id: string;
    title: string;
    duration_weeks: number | null;
    current_week: number;
    assignment_id: string;
    start_date: string;
  };
  current_week_workouts: Array<{
    id: string;
    title: string;
    day_of_week: number | null;
    exercises: Array<{
      workout_exercise_id: string;
      exercise_id: string;
      exercise_name: string;
      sets: number | null;
      reps: string | null;
      load: string | null;
      rest_seconds: number | null;
    }>;
  }>;
  recent_workout_logs: Array<{
    logged_at: string;
    workout_title: string | null;
    duration_min: number | null;
    overall_rpe: number | null;
    energy_level: number | null;
    status: string;
    exercises: Array<{
      exercise_name: string;
      sets_completed: number;
      sets_total: number;
      avg_rpe: number | null;
      avg_load: number | null;
      load_unit: string | null;
    }>;
  }>;
  recent_check_ins: Array<{
    week_start_date: string;
    sleep_quality: number | null;
    stress_level: number | null;
    soreness_level: number | null;
    weight: number | null;
    weight_unit: string | null;
    notes: string | null;
  }>;
}

export async function assembleAdaptiveContext(
  coachId: string,
  clientId: string
): Promise<AdaptiveAnalysisContext | null> {
  const supabase = await createClient();

  // Parallel: basic data
  const [
    { data: clientRow },
    { data: profile },
    { data: assignment },
    { data: exercises },
    { data: checkIns },
  ] = await Promise.all([
    supabase.from("clients").select("goals").eq("id", clientId).eq("coach_id", coachId).single(),
    supabase.from("profiles").select("full_name").eq("id", clientId).single(),
    supabase
      .from("program_assignments")
      .select("id, program_id, start_date, programs(id, title, duration_weeks)")
      .eq("client_id", clientId)
      .eq("coach_id", coachId)
      .eq("status", "active")
      .order("assigned_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("exercises")
      .select("id, name, category, muscle_groups")
      .or(`coach_id.eq.${coachId},coach_id.is.null`)
      .order("name")
      .limit(200),
    supabase
      .from("check_ins")
      .select("week_start_date, sleep_quality, stress_level, soreness_level, weight, weight_unit, notes")
      .eq("client_id", clientId)
      .order("week_start_date", { ascending: false })
      .limit(4),
  ]);

  if (!clientRow || !assignment) return null;

  const prog = assignment.programs as unknown as { id: string; title: string; duration_weeks: number | null } | null;
  if (!prog) return null;

  // Calculate current week number
  const startDate = new Date(assignment.start_date);
  const now = new Date();
  const currentWeek = Math.max(1, Math.floor((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1);

  // Load current week's workouts with exercises
  const { data: weekRow } = await supabase
    .from("weeks")
    .select("id")
    .eq("program_id", prog.id)
    .eq("week_number", currentWeek)
    .maybeSingle();

  const currentWeekWorkouts: AdaptiveAnalysisContext["current_week_workouts"] = [];
  if (weekRow) {
    const { data: workouts } = await supabase
      .from("workouts")
      .select("id, title, day_of_week")
      .eq("week_id", weekRow.id)
      .order("order_index");

    for (const wo of workouts ?? []) {
      const { data: wes } = await supabase
        .from("workout_exercises")
        .select("id, exercise_id, sets, reps, load, rest_seconds, exercises(name)")
        .eq("workout_id", wo.id)
        .order("order_index");

      currentWeekWorkouts.push({
        id: wo.id,
        title: wo.title,
        day_of_week: wo.day_of_week,
        exercises: (wes ?? []).map(we => {
          const exName = (we.exercises as unknown as { name: string } | null)?.name ?? "Unknown";
          return {
            workout_exercise_id: we.id,
            exercise_id: we.exercise_id,
            exercise_name: exName,
            sets: we.sets,
            reps: we.reps,
            load: we.load,
            rest_seconds: we.rest_seconds,
          };
        }),
      });
    }
  }

  // Load recent workout logs (last 4 weeks) with exercise/set detail
  const fourWeeksAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString();
  const { data: logs } = await supabase
    .from("workout_logs")
    .select("id, logged_at, duration_min, overall_rpe, energy_level, status, workouts(title)")
    .eq("client_id", clientId)
    .eq("status", "completed")
    .gte("logged_at", fourWeeksAgo)
    .order("logged_at", { ascending: false })
    .limit(16);

  const recentWorkoutLogs: AdaptiveAnalysisContext["recent_workout_logs"] = [];
  for (const log of logs ?? []) {
    const workoutTitle = (log.workouts as unknown as { title: string } | null)?.title ?? null;

    const { data: exLogs } = await supabase
      .from("exercise_logs")
      .select("id, exercise_id, exercises(name)")
      .eq("workout_log_id", log.id);

    const exerciseSummaries = [];
    for (const el of exLogs ?? []) {
      const { data: sets } = await supabase
        .from("set_logs")
        .select("reps_completed, load, load_unit, rpe, completed")
        .eq("exercise_log_id", el.id);

      const completedSets = (sets ?? []).filter(s => s.completed);
      const rpeSets = completedSets.filter(s => s.rpe != null);
      const loadSets = completedSets.filter(s => s.load != null);

      const exName = (el.exercises as unknown as { name: string } | null)?.name ?? "Unknown";
      exerciseSummaries.push({
        exercise_name: exName,
        sets_completed: completedSets.length,
        sets_total: (sets ?? []).length,
        avg_rpe: rpeSets.length > 0 ? Math.round(rpeSets.reduce((a, s) => a + (s.rpe ?? 0), 0) / rpeSets.length * 10) / 10 : null,
        avg_load: loadSets.length > 0 ? Math.round(loadSets.reduce((a, s) => a + (s.load ?? 0), 0) / loadSets.length * 10) / 10 : null,
        load_unit: loadSets[0]?.load_unit ?? null,
      });
    }

    recentWorkoutLogs.push({
      logged_at: log.logged_at,
      workout_title: workoutTitle,
      duration_min: log.duration_min,
      overall_rpe: log.overall_rpe,
      energy_level: log.energy_level,
      status: log.status,
      exercises: exerciseSummaries,
    });
  }

  return {
    coach: { id: coachId, exercise_library: exercises ?? [] },
    client: { id: clientId, name: profile?.full_name ?? null, goals: clientRow.goals },
    program: {
      id: prog.id,
      title: prog.title,
      duration_weeks: prog.duration_weeks,
      current_week: currentWeek,
      assignment_id: assignment.id,
      start_date: assignment.start_date,
    },
    current_week_workouts: currentWeekWorkouts,
    recent_workout_logs: recentWorkoutLogs,
    recent_check_ins: checkIns ?? [],
  };
}
