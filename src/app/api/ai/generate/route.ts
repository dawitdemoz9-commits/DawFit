import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { assembleProgramContext, assembleWorkoutContext } from "@/lib/ai/context";
import { buildProgramPrompt, buildWorkoutPrompt, SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { parseProgramDraft, parseWorkoutDraft, AIParseError } from "@/lib/ai/parser";
import type { ProgramGenerationContext, WorkoutGenerationContext } from "@/lib/ai/context";
import { z } from "zod";

const ProgramRequestSchema = z.object({
  type: z.literal("program"),
  client_id: z.string().uuid(),
  constraints: z.object({
    duration_weeks: z.number().int().min(1).max(52),
    sessions_per_week: z.number().int().min(1).max(7),
    session_duration_min: z.number().int().min(20).max(180),
    equipment: z.array(z.string()),
    experience_level: z.enum(["beginner", "intermediate", "advanced"]),
    injuries_limitations: z.string(),
    focus_areas: z.array(z.string()),
    additional_notes: z.string(),
  }),
});

const WorkoutRequestSchema = z.object({
  type: z.literal("workout"),
  constraints: z.object({
    title: z.string().min(1),
    session_duration_min: z.number().int().min(20).max(180),
    equipment: z.array(z.string()),
    target_muscle_groups: z.array(z.string()),
    experience_level: z.enum(["beginner", "intermediate", "advanced"]),
    intensity: z.enum(["low", "moderate", "high"]),
    additional_notes: z.string(),
  }),
});

const RequestSchema = z.discriminatedUnion("type", [ProgramRequestSchema, WorkoutRequestSchema]);

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify coach role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "coach") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });

  try {
    if (parsed.data.type === "program") {
      const { client_id, constraints } = parsed.data;

      const ctx = await assembleProgramContext(
        user.id,
        client_id,
        constraints as ProgramGenerationContext["constraints"]
      );

      const prompt = buildProgramPrompt(ctx);

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 8192,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }],
      });

      const rawOutput = message.content[0].type === "text" ? message.content[0].text : "";

      let programDraft;
      try {
        programDraft = parseProgramDraft(rawOutput);
      } catch (e) {
        const msg = e instanceof AIParseError ? e.message : "Failed to parse AI response";
        return NextResponse.json({ error: msg, raw: rawOutput }, { status: 422 });
      }

      // Store in ai_drafts
      const { data: draft, error: insertError } = await supabase
        .from("ai_drafts")
        .insert({
          coach_id: user.id,
          client_id,
          type: "program",
          status: "pending",
          prompt_context: ctx as unknown as import("@/types/database").Json,
          raw_output: rawOutput as unknown as import("@/types/database").Json,
          parsed_content: programDraft as unknown as import("@/types/database").Json,
        })
        .select("id")
        .single();

      if (insertError || !draft) {
        return NextResponse.json({ error: "Failed to save draft" }, { status: 500 });
      }

      return NextResponse.json({ draft_id: draft.id, preview: programDraft });

    } else {
      // workout
      const { constraints } = parsed.data;

      const ctx = await assembleWorkoutContext(
        user.id,
        constraints as WorkoutGenerationContext["constraints"]
      );

      const prompt = buildWorkoutPrompt(ctx);

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }],
      });

      const rawOutput = message.content[0].type === "text" ? message.content[0].text : "";

      let workoutDraft;
      try {
        workoutDraft = parseWorkoutDraft(rawOutput);
      } catch (e) {
        const msg = e instanceof AIParseError ? e.message : "Failed to parse AI response";
        return NextResponse.json({ error: msg, raw: rawOutput }, { status: 422 });
      }

      const { data: draft, error: insertError } = await supabase
        .from("ai_drafts")
        .insert({
          coach_id: user.id,
          client_id: null,
          type: "workout",
          status: "pending",
          prompt_context: ctx as unknown as import("@/types/database").Json,
          raw_output: rawOutput as unknown as import("@/types/database").Json,
          parsed_content: workoutDraft as unknown as import("@/types/database").Json,
        })
        .select("id")
        .single();

      if (insertError || !draft) {
        return NextResponse.json({ error: "Failed to save draft" }, { status: 500 });
      }

      return NextResponse.json({ draft_id: draft.id, preview: workoutDraft });
    }
  } catch (err) {
    console.error("[AI Generate]", err);
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
