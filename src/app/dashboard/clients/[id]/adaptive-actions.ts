"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { AdaptiveAnalysisOutput } from "@/lib/ai/adaptive-prompts";

export async function rejectAdaptiveSuggestion(suggestionId: string, clientId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  await supabase
    .from("adaptive_suggestions")
    .update({ status: "rejected" })
    .eq("id", suggestionId)
    .eq("coach_id", user.id);

  revalidatePath(`/dashboard/clients/${clientId}`);
}

/**
 * Approves an adaptive suggestion.
 * For load_adjustment, rep_change, rest_change, exercise_swap:
 *   — finds the matching workout_exercise via workout_exercise_id from the ai_draft
 *   — applies the specific field mutation
 * For deload:
 *   — marks approved as a record only (coach applies manually)
 */
export async function approveAdaptiveSuggestion(
  suggestionId: string,
  draftId: string,
  suggestionIndex: number,
  clientId: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Load the ai_draft to get the specific suggestion details
  const { data: draft } = await supabase
    .from("ai_drafts")
    .select("parsed_content")
    .eq("id", draftId)
    .eq("coach_id", user.id)
    .single();

  if (!draft) throw new Error("AI draft not found");

  const analysisOutput = draft.parsed_content as unknown as AdaptiveAnalysisOutput;
  const suggestion = analysisOutput.suggestions[suggestionIndex];
  if (!suggestion) throw new Error("Suggestion index out of range");

  // Apply the mutation based on type
  if (suggestion.suggestion_type !== "deload" && suggestion.workout_exercise_id && suggestion.field && suggestion.new_value) {
    const fieldMap: Record<string, string> = {
      load: "load",
      reps: "reps",
      rest_seconds: "rest_seconds",
      sets: "sets",
    };

    const dbField = fieldMap[suggestion.field];
    if (dbField) {
      const value = suggestion.field === "rest_seconds" || suggestion.field === "sets"
        ? Number(suggestion.new_value)
        : suggestion.new_value;

      const { error } = await supabase
        .from("workout_exercises")
        .update({ [dbField]: value })
        .eq("id", suggestion.workout_exercise_id);

      if (error) throw new Error(`Failed to apply change: ${error.message}`);
    }
  }

  if (suggestion.suggestion_type === "exercise_swap" && suggestion.workout_exercise_id) {
    // Resolve the swap target exercise ID from the library by name
    if (suggestion.swap_to_exercise_id) {
      await supabase
        .from("workout_exercises")
        .update({ exercise_id: suggestion.swap_to_exercise_id })
        .eq("id", suggestion.workout_exercise_id);
    } else if (suggestion.swap_to_exercise_name) {
      const { data: swapEx } = await supabase
        .from("exercises")
        .select("id")
        .or(`coach_id.eq.${user.id},coach_id.is.null`)
        .ilike("name", suggestion.swap_to_exercise_name)
        .limit(1)
        .single();

      if (swapEx) {
        await supabase
          .from("workout_exercises")
          .update({ exercise_id: swapEx.id })
          .eq("id", suggestion.workout_exercise_id);
      }
    }
  }

  // Mark the adaptive_suggestion as approved
  await supabase
    .from("adaptive_suggestions")
    .update({ status: "approved" })
    .eq("id", suggestionId)
    .eq("coach_id", user.id);

  revalidatePath(`/dashboard/clients/${clientId}`);
}
