import type { AdaptiveAnalysisOutput, AdaptiveSuggestionDraft, SuggestionType } from "./adaptive-prompts";
import { AIParseError } from "./parser";

const VALID_TYPES: SuggestionType[] = ["load_adjustment", "deload", "exercise_swap", "rep_change", "rest_change"];
const VALID_FIELDS = ["load", "reps", "rest_seconds", "sets", null];
const VALID_PRIORITIES = ["low", "medium", "high"];

function stripMarkdown(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
}

export function parseAdaptiveOutput(raw: string): AdaptiveAnalysisOutput {
  const cleaned = stripMarkdown(raw);
  let parsed: unknown;

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new AIParseError("Adaptive analysis response was not valid JSON", raw);
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new AIParseError("Parsed response is not an object", raw);
  }

  const p = parsed as Record<string, unknown>;

  if (typeof p.analysis_summary !== "string") {
    throw new AIParseError("Missing analysis_summary", raw);
  }

  if (!Array.isArray(p.suggestions)) {
    throw new AIParseError("Missing suggestions array", raw);
  }

  const suggestions: AdaptiveSuggestionDraft[] = p.suggestions.map((s: unknown, i: number) => {
    if (typeof s !== "object" || s === null) {
      throw new AIParseError(`Suggestion ${i} is not an object`, raw);
    }
    const sug = s as Record<string, unknown>;

    const suggestion_type = String(sug.suggestion_type ?? "");
    if (!VALID_TYPES.includes(suggestion_type as SuggestionType)) {
      throw new AIParseError(`Suggestion ${i} has invalid type: ${suggestion_type}`, raw);
    }

    const priority = String(sug.priority ?? "medium");

    return {
      suggestion_type: suggestion_type as SuggestionType,
      target_week: sug.target_week != null ? Number(sug.target_week) : null,
      workout_title: sug.workout_title ? String(sug.workout_title) : null,
      exercise_name: sug.exercise_name ? String(sug.exercise_name) : null,
      workout_exercise_id: sug.workout_exercise_id ? String(sug.workout_exercise_id) : null,
      swap_to_exercise_id: sug.swap_to_exercise_id ? String(sug.swap_to_exercise_id) : null,
      swap_to_exercise_name: sug.swap_to_exercise_name ? String(sug.swap_to_exercise_name) : null,
      field: VALID_FIELDS.includes(sug.field as string | null) ? (sug.field as "load" | "reps" | "rest_seconds" | "sets" | null) : null,
      current_value: sug.current_value ? String(sug.current_value) : null,
      new_value: sug.new_value ? String(sug.new_value) : null,
      change_description: String(sug.change_description ?? "No description"),
      rationale: String(sug.rationale ?? "No rationale provided"),
      priority: VALID_PRIORITIES.includes(priority) ? (priority as "low" | "medium" | "high") : "medium",
    };
  });

  return {
    analysis_summary: String(p.analysis_summary),
    data_quality: ["good", "limited", "insufficient"].includes(String(p.data_quality))
      ? (String(p.data_quality) as "good" | "limited" | "insufficient")
      : "limited",
    data_quality_note: p.data_quality_note ? String(p.data_quality_note) : null,
    suggestions,
  };
}
