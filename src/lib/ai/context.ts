import { createClient } from "@/lib/supabase/server";

export interface ProgramGenerationContext {
  coach: {
    business_name: string | null;
    exercise_library: Array<{ id: string; name: string; category: string | null; muscle_groups: string[] | null; equipment: string[] | null }>;
    sample_program_titles: string[];
  };
  client: {
    id: string;
    goals: string | null;
    recent_check_in: {
      sleep_quality: number | null;
      stress_level: number | null;
      soreness_level: number | null;
      weight: number | null;
      weight_unit: string | null;
      notes: string | null;
    } | null;
  };
  constraints: {
    duration_weeks: number;
    sessions_per_week: number;
    session_duration_min: number;
    equipment: string[];
    experience_level: "beginner" | "intermediate" | "advanced";
    injuries_limitations: string;
    focus_areas: string[];
    additional_notes: string;
  };
}

export interface WorkoutGenerationContext {
  coach: {
    exercise_library: Array<{ id: string; name: string; category: string | null; muscle_groups: string[] | null; equipment: string[] | null }>;
  };
  constraints: {
    title: string;
    session_duration_min: number;
    equipment: string[];
    target_muscle_groups: string[];
    experience_level: "beginner" | "intermediate" | "advanced";
    intensity: "low" | "moderate" | "high";
    additional_notes: string;
  };
}

export async function assembleProgramContext(
  coachId: string,
  clientId: string,
  constraints: ProgramGenerationContext["constraints"]
): Promise<ProgramGenerationContext> {
  const supabase = await createClient();

  const [
    { data: coach },
    { data: exercises },
    { data: programs },
    { data: client },
    { data: checkIns },
  ] = await Promise.all([
    supabase.from("coaches").select("business_name").eq("id", coachId).single(),
    supabase
      .from("exercises")
      .select("id, name, category, muscle_groups, equipment")
      .or(`coach_id.eq.${coachId},coach_id.is.null`)
      .order("name")
      .limit(200),
    supabase
      .from("programs")
      .select("title")
      .eq("coach_id", coachId)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("clients")
      .select("goals")
      .eq("id", clientId)
      .eq("coach_id", coachId)
      .single(),
    supabase
      .from("check_ins")
      .select("sleep_quality, stress_level, soreness_level, weight, weight_unit, notes")
      .eq("client_id", clientId)
      .order("week_start_date", { ascending: false })
      .limit(1),
  ]);

  return {
    coach: {
      business_name: coach?.business_name ?? null,
      exercise_library: exercises ?? [],
      sample_program_titles: (programs ?? []).map(p => p.title),
    },
    client: {
      id: clientId,
      goals: client?.goals ?? null,
      recent_check_in: checkIns?.[0] ?? null,
    },
    constraints,
  };
}

export async function assembleWorkoutContext(
  coachId: string,
  constraints: WorkoutGenerationContext["constraints"]
): Promise<WorkoutGenerationContext> {
  const supabase = await createClient();

  const { data: exercises } = await supabase
    .from("exercises")
    .select("id, name, category, muscle_groups, equipment")
    .or(`coach_id.eq.${coachId},coach_id.is.null`)
    .order("name")
    .limit(200);

  return {
    coach: { exercise_library: exercises ?? [] },
    constraints,
  };
}
