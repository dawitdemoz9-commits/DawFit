import type { AIProgramDraft, AIWorkoutOnlyDraft } from "./prompts";

export class AIParseError extends Error {
  constructor(message: string, public raw?: string) {
    super(message);
    this.name = "AIParseError";
  }
}

function stripMarkdown(text: string): string {
  // Strip ```json ... ``` or ``` ... ``` wrappers Claude sometimes adds
  return text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();
}

export function parseProgramDraft(raw: string): AIProgramDraft {
  const cleaned = stripMarkdown(raw);
  let parsed: unknown;

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new AIParseError("Claude response was not valid JSON", raw);
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new AIParseError("Parsed response is not an object", raw);
  }

  const p = parsed as Record<string, unknown>;

  if (typeof p.title !== "string") throw new AIParseError("Missing program title", raw);
  if (!Array.isArray(p.weeks)) throw new AIParseError("Missing weeks array", raw);
  if (typeof p.duration_weeks !== "number") throw new AIParseError("Missing duration_weeks", raw);

  // Validate and coerce weeks
  const weeks = p.weeks.map((w: unknown, wi: number) => {
    if (typeof w !== "object" || w === null) throw new AIParseError(`Week ${wi} is not an object`, raw);
    const week = w as Record<string, unknown>;

    if (!Array.isArray(week.workouts)) throw new AIParseError(`Week ${wi} missing workouts array`, raw);

    const workouts = week.workouts.map((wo: unknown, woi: number) => {
      if (typeof wo !== "object" || wo === null) throw new AIParseError(`Workout ${woi} in week ${wi} is not an object`, raw);
      const workout = wo as Record<string, unknown>;

      if (!Array.isArray(workout.exercises)) throw new AIParseError(`Workout ${woi} missing exercises`, raw);

      const exercises = workout.exercises.map((ex: unknown) => {
        if (typeof ex !== "object" || ex === null) throw new AIParseError("Exercise is not an object", raw);
        const e = ex as Record<string, unknown>;
        return {
          exercise_name: String(e.exercise_name ?? ""),
          sets: Number(e.sets ?? 3),
          reps: String(e.reps ?? "8-10"),
          load: String(e.load ?? "RPE 7"),
          rest_seconds: Number(e.rest_seconds ?? 90),
          notes: e.notes ? String(e.notes) : null,
        };
      });

      return {
        title: String(workout.title ?? "Session"),
        description: workout.description ? String(workout.description) : null,
        day_of_week: Number(workout.day_of_week ?? 1),
        estimated_duration_min: Number(workout.estimated_duration_min ?? 60),
        exercises,
      };
    });

    return {
      week_number: Number(week.week_number ?? wi + 1),
      label: String(week.label ?? `Week ${wi + 1}`),
      notes: week.notes ? String(week.notes) : null,
      workouts,
    };
  });

  return {
    title: String(p.title),
    description: p.description ? String(p.description) : "",
    duration_weeks: Number(p.duration_weeks),
    weeks,
  };
}

export function parseWorkoutDraft(raw: string): AIWorkoutOnlyDraft {
  const cleaned = stripMarkdown(raw);
  let parsed: unknown;

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new AIParseError("Claude response was not valid JSON", raw);
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new AIParseError("Parsed response is not an object", raw);
  }

  const p = parsed as Record<string, unknown>;

  if (typeof p.title !== "string") throw new AIParseError("Missing workout title", raw);
  if (!Array.isArray(p.exercises)) throw new AIParseError("Missing exercises array", raw);

  const exercises = p.exercises.map((ex: unknown) => {
    if (typeof ex !== "object" || ex === null) throw new AIParseError("Exercise is not an object", raw);
    const e = ex as Record<string, unknown>;
    return {
      exercise_name: String(e.exercise_name ?? ""),
      sets: Number(e.sets ?? 3),
      reps: String(e.reps ?? "8-10"),
      load: String(e.load ?? "RPE 7"),
      rest_seconds: Number(e.rest_seconds ?? 90),
      notes: e.notes ? String(e.notes) : null,
    };
  });

  return {
    title: String(p.title),
    description: p.description ? String(p.description) : null,
    estimated_duration_min: Number(p.estimated_duration_min ?? 60),
    exercises,
  };
}

/**
 * Fuzzy match exercise names from AI output to real exercise IDs.
 * Returns a map: exercise_name (lowercase) → exercise_id
 */
export function buildExerciseNameMap(
  library: Array<{ id: string; name: string }>
): Map<string, string> {
  const map = new Map<string, string>();
  for (const ex of library) {
    map.set(ex.name.toLowerCase().trim(), ex.id);
  }
  return map;
}

export function resolveExerciseId(
  name: string,
  nameMap: Map<string, string>
): string | null {
  const exact = nameMap.get(name.toLowerCase().trim());
  if (exact) return exact;

  // Partial match fallback
  const normalized = name.toLowerCase().trim();
  for (const [key, id] of nameMap) {
    if (key.includes(normalized) || normalized.includes(key)) {
      return id;
    }
  }
  return null;
}
