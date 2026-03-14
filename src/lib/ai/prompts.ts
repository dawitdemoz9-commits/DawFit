import type { ProgramGenerationContext, WorkoutGenerationContext } from "./context";

// ─── Output types ────────────────────────────────────────────────────────────

export interface AIExercise {
  exercise_name: string;
  sets: number;
  reps: string;        // "8-10", "AMRAP", "5"
  load: string;        // "RPE 7", "135 lbs", "BW", "60% 1RM"
  rest_seconds: number;
  notes: string | null;
}

export interface AIWorkoutDraft {
  title: string;
  description: string | null;
  day_of_week: number; // 0 = Sunday, 1 = Monday … 6 = Saturday
  estimated_duration_min: number;
  exercises: AIExercise[];
}

export interface AIWeekDraft {
  week_number: number;
  label: string;
  notes: string | null;
  workouts: AIWorkoutDraft[];
}

export interface AIProgramDraft {
  title: string;
  description: string;
  duration_weeks: number;
  weeks: AIWeekDraft[];
}

export interface AIWorkoutOnlyDraft {
  title: string;
  description: string | null;
  estimated_duration_min: number;
  exercises: AIExercise[];
}

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert fitness programming assistant for a professional coaching platform called DawFit.
You create structured, periodized training programs and workouts for coaches to review before assigning to clients.

Rules:
- Only use exercises from the provided exercise library. Reference them by exact name.
- Structure programming with sound principles: progressive overload, appropriate rest, balanced muscle groups.
- For the "load" field: recommend specific weights (e.g. "135 lbs", "50 lbs") based on the client's experience level using standard strength benchmarks. Beginner = light learning loads, Intermediate = standard working weights, Advanced = heavy loads. If the coach provides known lift numbers in the notes, base percentages on those. Use "Bodyweight" for pure bodyweight moves. Only fall back to RPE (e.g. "RPE 7") when weight is genuinely not applicable.
- Rep ranges should be strings: "8-10", "3-5", "AMRAP", "12-15", etc.
- Day of week: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
- Spread sessions across the week with adequate recovery between similar muscle groups.
- Always respond with valid JSON only — no markdown, no explanation, just the JSON object.`;

// ─── Program generation prompt ────────────────────────────────────────────────

export function buildProgramPrompt(ctx: ProgramGenerationContext): string {
  const { coach, client, constraints } = ctx;

  const exerciseList = coach.exercise_library
    .map(e => `  - ${e.name}${e.category ? ` (${e.category})` : ""}${e.muscle_groups?.length ? ` [${e.muscle_groups.join(", ")}]` : ""}`)
    .join("\n");

  const checkInSummary = client.recent_check_in
    ? `Sleep: ${client.recent_check_in.sleep_quality ?? "N/A"}/5, Stress: ${client.recent_check_in.stress_level ?? "N/A"}/5, Soreness: ${client.recent_check_in.soreness_level ?? "N/A"}/5${client.recent_check_in.weight ? `, Weight: ${client.recent_check_in.weight}${client.recent_check_in.weight_unit ?? "lbs"}` : ""}${client.recent_check_in.notes ? `\nNotes: "${client.recent_check_in.notes}"` : ""}`
    : "No recent check-in data";

  return `Generate a complete ${constraints.duration_weeks}-week training program.

COACH CONTEXT:
Business: ${coach.business_name ?? "DawFit Coach"}
Sample program styles: ${coach.sample_program_titles.length > 0 ? coach.sample_program_titles.join(", ") : "None yet"}

EXERCISE LIBRARY (use ONLY these exercises by exact name):
${exerciseList}

CLIENT PROFILE:
Goals: ${client.goals ?? "General fitness and strength"}
Most recent check-in: ${checkInSummary}

PROGRAM CONSTRAINTS:
- Duration: ${constraints.duration_weeks} weeks
- Sessions per week: ${constraints.sessions_per_week}
- Session duration: ~${constraints.session_duration_min} minutes
- Equipment available: ${constraints.equipment.length > 0 ? constraints.equipment.join(", ") : "Full gym"}
- Experience level: ${constraints.experience_level}
- Focus areas: ${constraints.focus_areas.length > 0 ? constraints.focus_areas.join(", ") : "Full body"}
- Injuries/limitations: ${constraints.injuries_limitations || "None"}
- Additional notes: ${constraints.additional_notes || "None"}

Respond with ONLY this JSON structure (no markdown):
{
  "title": "Program title",
  "description": "2-3 sentence program description",
  "duration_weeks": ${constraints.duration_weeks},
  "weeks": [
    {
      "week_number": 1,
      "label": "Foundation",
      "notes": "Brief coaching note for this week or null",
      "workouts": [
        {
          "title": "Session name",
          "description": "Brief session focus or null",
          "day_of_week": 1,
          "estimated_duration_min": 60,
          "exercises": [
            {
              "exercise_name": "Exact name from library",
              "sets": 3,
              "reps": "8-10",
              "load": "RPE 7",
              "rest_seconds": 90,
              "notes": null
            }
          ]
        }
      ]
    }
  ]
}`;
}

// ─── Workout generation prompt ────────────────────────────────────────────────

export function buildWorkoutPrompt(ctx: WorkoutGenerationContext): string {
  const { coach, constraints } = ctx;

  const exerciseList = coach.exercise_library
    .map(e => `  - ${e.name}${e.category ? ` (${e.category})` : ""}${e.muscle_groups?.length ? ` [${e.muscle_groups.join(", ")}]` : ""}`)
    .join("\n");

  return `Generate a single training session/workout.

EXERCISE LIBRARY (use ONLY these exercises by exact name):
${exerciseList}

WORKOUT CONSTRAINTS:
- Title: ${constraints.title}
- Duration: ~${constraints.session_duration_min} minutes
- Equipment: ${constraints.equipment.length > 0 ? constraints.equipment.join(", ") : "Full gym"}
- Target muscles: ${constraints.target_muscle_groups.length > 0 ? constraints.target_muscle_groups.join(", ") : "Full body"}
- Experience level: ${constraints.experience_level}
- Intensity: ${constraints.intensity}
- Additional notes: ${constraints.additional_notes || "None"}

Respond with ONLY this JSON structure (no markdown):
{
  "title": "Workout title",
  "description": "Brief session description or null",
  "estimated_duration_min": ${constraints.session_duration_min},
  "exercises": [
    {
      "exercise_name": "Exact name from library",
      "sets": 3,
      "reps": "8-10",
      "load": "RPE 7",
      "rest_seconds": 90,
      "notes": null
    }
  ]
}`;
}

export { SYSTEM_PROMPT };
