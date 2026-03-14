"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { buildExerciseNameMap, resolveExerciseId } from "@/lib/ai/parser";
import type { AIProgramDraft, AIWorkoutOnlyDraft } from "@/lib/ai/prompts";

export async function rejectDraft(draftId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  await supabase
    .from("ai_drafts")
    .update({ status: "rejected", reviewed_at: new Date().toISOString() })
    .eq("id", draftId)
    .eq("coach_id", user.id);

  revalidatePath("/dashboard/ai");
  redirect("/dashboard/ai");
}

export async function updateDraftContent(draftId: string, content: AIProgramDraft | AIWorkoutOnlyDraft) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  await supabase
    .from("ai_drafts")
    .update({
      parsed_content: content as unknown as import("@/types/database").Json,
      status: "pending",
    })
    .eq("id", draftId)
    .eq("coach_id", user.id);

  revalidatePath(`/dashboard/ai/${draftId}`);
}

/**
 * Approves a program draft:
 * 1. Validates draft belongs to this coach
 * 2. Creates program → weeks → workouts → workout_exercises (resolving exercise IDs)
 * 3. Marks draft approved
 */
export async function approveProgramDraft(draftId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Load draft
  const { data: draft } = await supabase
    .from("ai_drafts")
    .select("*")
    .eq("id", draftId)
    .eq("coach_id", user.id)
    .eq("type", "program")
    .single();

  if (!draft || draft.status !== "pending") {
    throw new Error("Draft not found or already reviewed");
  }

  const programDraft = draft.parsed_content as unknown as AIProgramDraft;

  // Load coach's exercise library for name → ID resolution
  const { data: exercises } = await supabase
    .from("exercises")
    .select("id, name")
    .or(`coach_id.eq.${user.id},coach_id.is.null`);

  const nameMap = buildExerciseNameMap(exercises ?? []);

  // 1. Create program
  const { data: program, error: progErr } = await supabase
    .from("programs")
    .insert({
      coach_id: user.id,
      title: programDraft.title,
      description: programDraft.description,
      duration_weeks: programDraft.duration_weeks,
      status: "draft",
      source: "ai_approved",
      is_template: false,
    })
    .select("id")
    .single();

  if (progErr || !program) throw new Error(progErr?.message ?? "Failed to create program");

  // 2. Create weeks
  for (const week of programDraft.weeks) {
    const { data: weekRow, error: weekErr } = await supabase
      .from("weeks")
      .insert({
        program_id: program.id,
        week_number: week.week_number,
        label: week.label,
        notes: week.notes,
      })
      .select("id")
      .single();

    if (weekErr || !weekRow) throw new Error(weekErr?.message ?? "Failed to create week");

    // 3. Create workouts in this week
    for (let wi = 0; wi < week.workouts.length; wi++) {
      const wo = week.workouts[wi];

      const { data: workout, error: woErr } = await supabase
        .from("workouts")
        .insert({
          coach_id: user.id,
          week_id: weekRow.id,
          title: wo.title,
          description: wo.description,
          day_of_week: wo.day_of_week,
          order_index: wi,
          estimated_duration_min: wo.estimated_duration_min,
          status: "draft",
          is_template: false,
        })
        .select("id")
        .single();

      if (woErr || !workout) throw new Error(woErr?.message ?? "Failed to create workout");

      // 4. Create workout_exercises
      const weInserts = [];
      for (let ei = 0; ei < wo.exercises.length; ei++) {
        const ex = wo.exercises[ei];
        let exerciseId = resolveExerciseId(ex.exercise_name, nameMap);

        if (!exerciseId) {
          const { data: created } = await supabase
            .from("exercises")
            .insert({ coach_id: user.id, name: ex.exercise_name, is_public: false })
            .select("id")
            .single();
          if (created) {
            exerciseId = created.id;
            nameMap.set(ex.exercise_name.toLowerCase().trim(), created.id);
          }
        }

        weInserts.push({
          workout_id: workout.id,
          exercise_id: exerciseId,
          order_index: ei,
          sets: ex.sets,
          reps: ex.reps,
          load: ex.load,
          rest_seconds: ex.rest_seconds,
          notes: ex.notes,
        });
      }

      if (weInserts.length > 0) {
        await supabase.from("workout_exercises").insert(weInserts);
      }
    }
  }

  // 5. Mark draft approved
  await supabase
    .from("ai_drafts")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
      approved_resource_id: program.id,
    })
    .eq("id", draftId);

  revalidatePath("/dashboard/ai");
  revalidatePath("/dashboard/programs");
  redirect(`/dashboard/programs/${program.id}`);
}

/**
 * Approves a standalone workout draft → creates workout (no week association)
 */
export async function approveWorkoutDraft(draftId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: draft } = await supabase
    .from("ai_drafts")
    .select("*")
    .eq("id", draftId)
    .eq("coach_id", user.id)
    .eq("type", "workout")
    .single();

  if (!draft || draft.status !== "pending") throw new Error("Draft not found or already reviewed");

  const workoutDraft = draft.parsed_content as unknown as AIWorkoutOnlyDraft;

  const { data: exercises } = await supabase
    .from("exercises")
    .select("id, name")
    .or(`coach_id.eq.${user.id},coach_id.is.null`);

  const nameMap = buildExerciseNameMap(exercises ?? []);

  const { data: workout, error: woErr } = await supabase
    .from("workouts")
    .insert({
      coach_id: user.id,
      week_id: null,
      title: workoutDraft.title,
      description: workoutDraft.description,
      estimated_duration_min: workoutDraft.estimated_duration_min,
      order_index: 0,
      status: "draft",
      is_template: false,
    })
    .select("id")
    .single();

  if (woErr || !workout) throw new Error(woErr?.message ?? "Failed to create workout");

  const weInserts = [];
  for (let ei = 0; ei < workoutDraft.exercises.length; ei++) {
    const ex = workoutDraft.exercises[ei];
    let exerciseId = resolveExerciseId(ex.exercise_name, nameMap);

    if (!exerciseId) {
      // Auto-create exercise so nothing gets dropped
      const { data: created } = await supabase
        .from("exercises")
        .insert({ coach_id: user.id, name: ex.exercise_name, is_public: false })
        .select("id")
        .single();
      if (created) {
        exerciseId = created.id;
        nameMap.set(ex.exercise_name.toLowerCase().trim(), created.id);
      }
    }

    if (!exerciseId) continue;
    weInserts.push({
      workout_id: workout.id,
      exercise_id: exerciseId,
      order_index: ei,
      sets: ex.sets,
      reps: ex.reps,
      load: ex.load,
      rest_seconds: ex.rest_seconds,
      notes: ex.notes,
    });
  }

  if (weInserts.length > 0) {
    await supabase.from("workout_exercises").insert(weInserts);
  }

  await supabase
    .from("ai_drafts")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
      approved_resource_id: workout.id,
    })
    .eq("id", draftId);

  revalidatePath("/dashboard/ai");
  revalidatePath("/dashboard/workouts");
  redirect(`/dashboard/workouts/${workout.id}`);
}
