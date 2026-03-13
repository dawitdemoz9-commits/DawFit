import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { assembleAdaptiveContext } from "@/lib/ai/adaptive-context";
import { buildAdaptivePrompt, ADAPTIVE_SYSTEM } from "@/lib/ai/adaptive-prompts";
import { parseAdaptiveOutput } from "@/lib/ai/adaptive-parser";
import { AIParseError } from "@/lib/ai/parser";
import { z } from "zod";
import type { Json } from "@/types/database";

const RequestSchema = z.object({
  client_id: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "coach") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { client_id } = parsed.data;

  // Assemble context — returns null if client has no active assignment
  const ctx = await assembleAdaptiveContext(user.id, client_id);
  if (!ctx) {
    return NextResponse.json(
      { error: "Client has no active program assignment. Assign a program first." },
      { status: 422 }
    );
  }

  if (ctx.recent_workout_logs.length === 0 && ctx.recent_check_ins.length === 0) {
    return NextResponse.json(
      { error: "Not enough data yet. Client needs at least one logged workout or check-in." },
      { status: 422 }
    );
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: ADAPTIVE_SYSTEM,
      messages: [{ role: "user", content: buildAdaptivePrompt(ctx) }],
    });

    const rawOutput = message.content[0].type === "text" ? message.content[0].text : "";

    let analysisOutput;
    try {
      analysisOutput = parseAdaptiveOutput(rawOutput);
    } catch (e) {
      const msg = e instanceof AIParseError ? e.message : "Failed to parse AI response";
      return NextResponse.json({ error: msg }, { status: 422 });
    }

    // Store in ai_drafts (type = adjustment_suggestion)
    const { data: draft, error: draftErr } = await supabase
      .from("ai_drafts")
      .insert({
        coach_id: user.id,
        client_id,
        type: "adjustment_suggestion",
        status: "pending",
        prompt_context: ctx as unknown as Json,
        raw_output: rawOutput as unknown as Json,
        parsed_content: analysisOutput as unknown as Json,
      })
      .select("id")
      .single();

    if (draftErr || !draft) {
      return NextResponse.json({ error: "Failed to save analysis draft" }, { status: 500 });
    }

    // Create individual adaptive_suggestion rows (one per suggestion)
    const suggestionInserts = analysisOutput.suggestions.map(s => ({
      coach_id: user.id,
      client_id,
      assignment_id: ctx.program.assignment_id,
      ai_draft_id: draft.id,
      suggestion_type: s.suggestion_type as
        | "load_adjustment"
        | "deload"
        | "exercise_swap"
        | "rep_change"
        | "rest_change",
      target_week: s.target_week,
      rationale: `${s.change_description}\n\n${s.rationale}`,
      status: "pending" as const,
    }));

    if (suggestionInserts.length > 0) {
      await supabase.from("adaptive_suggestions").insert(suggestionInserts);
    }

    return NextResponse.json({
      draft_id: draft.id,
      analysis: analysisOutput,
    });
  } catch (err) {
    console.error("[AI Analyze Client]", err);
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
