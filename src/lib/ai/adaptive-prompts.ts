import type { AdaptiveAnalysisContext } from "./adaptive-context";

// ─── Output types ─────────────────────────────────────────────────────────────

export type SuggestionType = "load_adjustment" | "deload" | "exercise_swap" | "rep_change" | "rest_change";

export interface AdaptiveSuggestionDraft {
  suggestion_type: SuggestionType;
  target_week: number | null;
  workout_title: string | null;
  exercise_name: string | null;
  // ID references for direct application — null if couldn't resolve
  workout_exercise_id: string | null;
  swap_to_exercise_id: string | null;  // only for exercise_swap
  swap_to_exercise_name: string | null;
  // What field to change and what to change it to
  field: "load" | "reps" | "rest_seconds" | "sets" | null;
  current_value: string | null;
  new_value: string | null;
  // Human-readable
  change_description: string;
  rationale: string;
  priority: "low" | "medium" | "high";
}

export interface AdaptiveAnalysisOutput {
  analysis_summary: string;
  data_quality: "good" | "limited" | "insufficient";
  data_quality_note: string | null;
  suggestions: AdaptiveSuggestionDraft[];
}

// ─── Prompt ───────────────────────────────────────────────────────────────────

const ADAPTIVE_SYSTEM = `You are an expert fitness programming analyst for professional coaches.
You analyze client training data and generate specific, evidence-based suggestions for coaches to review.

Rules:
- NEVER directly change programs. You only suggest changes.
- Each suggestion must reference exact exercise names from the provided exercise library.
- For exercise_swap: the replacement must be from the exercise library, target the same muscle group(s), and match the current training context.
- load_adjustment / rep_change / rest_change: reference the exact workout_exercise_id if available.
- Rationale must be specific, citing actual data (e.g. "avg RPE 6.1 over 3 sessions indicates…").
- If data is insufficient to make confident suggestions, say so clearly and return fewer (or zero) suggestions.
- Respond with ONLY valid JSON — no markdown, no explanation.`;

export function buildAdaptivePrompt(ctx: AdaptiveAnalysisContext): string {
  const exerciseLibrary = ctx.coach.exercise_library
    .map(e => `  - ${e.name}${e.category ? ` (${e.category})` : ""}${e.muscle_groups?.length ? ` [${e.muscle_groups.join(", ")}]` : ""}`)
    .join("\n");

  const checkInSummary = ctx.recent_check_ins.length > 0
    ? ctx.recent_check_ins.map(ci =>
        `  Week of ${ci.week_start_date}: Sleep ${ci.sleep_quality ?? "N/A"}/5, Stress ${ci.stress_level ?? "N/A"}/5, Soreness ${ci.soreness_level ?? "N/A"}/5${ci.weight ? `, Weight ${ci.weight}${ci.weight_unit ?? "lbs"}` : ""}${ci.notes ? `, Notes: "${ci.notes}"` : ""}`
      ).join("\n")
    : "  No check-in data available";

  const logSummary = ctx.recent_workout_logs.length > 0
    ? ctx.recent_workout_logs.map(log =>
        `  ${log.logged_at.split("T")[0]} — ${log.workout_title ?? "Unknown session"} (${log.duration_min ?? "?"}min, Overall RPE: ${log.overall_rpe ?? "N/A"}, Energy: ${log.energy_level ?? "N/A"}/5)\n` +
        log.exercises.map(e =>
          `    • ${e.exercise_name}: ${e.sets_completed}/${e.sets_total} sets completed, avg RPE: ${e.avg_rpe ?? "N/A"}${e.avg_load ? `, avg load: ${e.avg_load}${e.load_unit ?? ""}` : ""}`
        ).join("\n")
      ).join("\n\n")
    : "  No recent workout logs available";

  const currentWorkoutsSummary = ctx.current_week_workouts.length > 0
    ? ctx.current_week_workouts.map(wo =>
        `  ${wo.title} (day ${wo.day_of_week ?? "?"}):\n` +
        wo.exercises.map(e =>
          `    • [${e.workout_exercise_id}] ${e.exercise_name}: ${e.sets ?? "?"}x${e.reps ?? "?"} @ ${e.load ?? "?"}, rest ${e.rest_seconds ?? "?"}s`
        ).join("\n")
      ).join("\n\n")
    : "  No current week workouts found";

  return `Analyze this client's training data and generate adaptive suggestions.

CLIENT: ${ctx.client.name ?? "Unknown"} (ID: ${ctx.client.id})
GOALS: ${ctx.client.goals ?? "General fitness"}

CURRENT PROGRAM: "${ctx.program.title}"
Week ${ctx.program.current_week}${ctx.program.duration_weeks ? ` of ${ctx.program.duration_weeks}` : ""} (started ${ctx.program.start_date})

CURRENT WEEK'S WORKOUTS (use workout_exercise_id for direct references):
${currentWorkoutsSummary}

RECENT WORKOUT LOGS (last 4 weeks, completed sessions only):
${logSummary}

RECENT CHECK-INS (last 4 weeks):
${checkInSummary}

COACH'S EXERCISE LIBRARY (for swaps, use exact names):
${exerciseLibrary}

Generate 1–5 targeted suggestions. Consider:
- Exercises with consistently low RPE (underloaded) → load_adjustment up
- Exercises with consistently high RPE (9-10) → load_adjustment down or rep_change
- High stress + high soreness in check-ins → deload or rest_change
- Declining completion rates → rep_change down or exercise_swap
- Plateau patterns → load_adjustment or rep_change

Return ONLY this JSON:
{
  "analysis_summary": "2-3 sentence summary of key findings",
  "data_quality": "good|limited|insufficient",
  "data_quality_note": "null or brief note about data limitations",
  "suggestions": [
    {
      "suggestion_type": "load_adjustment|deload|exercise_swap|rep_change|rest_change",
      "target_week": ${ctx.program.current_week},
      "workout_title": "exact workout title or null",
      "exercise_name": "exact exercise name or null",
      "workout_exercise_id": "the [uuid] shown above or null",
      "swap_to_exercise_id": null,
      "swap_to_exercise_name": "exercise name from library for swaps, else null",
      "field": "load|reps|rest_seconds|sets|null",
      "current_value": "current value as string or null",
      "new_value": "proposed value as string or null",
      "change_description": "One clear sentence: what changes and why",
      "rationale": "Specific data-backed rationale citing actual numbers from the logs",
      "priority": "low|medium|high"
    }
  ]
}`;
}

export { ADAPTIVE_SYSTEM };
