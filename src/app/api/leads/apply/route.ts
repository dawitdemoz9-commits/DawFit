import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const applySchema = z.object({
  coach_id: z.string().uuid(),
  full_name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  source: z.string().max(100).optional().nullable(),
  goals: z.string().min(1).max(2000),
  experience_level: z.string().optional().nullable(),
  availability: z.string().optional().nullable(),
  budget_range: z.string().optional().nullable(),
  health_notes: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = applySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid data" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Use server client (no user auth needed — this is a public endpoint)
    const supabase = await createClient();

    // Verify coach exists
    const { data: coach } = await supabase
      .from("coaches")
      .select("id")
      .eq("id", data.coach_id)
      .single();

    if (!coach) {
      return NextResponse.json({ error: "Coach not found" }, { status: 404 });
    }

    // Check for duplicate lead by email + coach
    const { data: existing } = await supabase
      .from("leads")
      .select("id, status")
      .eq("coach_id", data.coach_id)
      .eq("email", data.email)
      .not("status", "eq", "rejected")
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "You have already applied to this coach. Check your email." },
        { status: 409 }
      );
    }

    // Create lead
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        coach_id: data.coach_id,
        email: data.email,
        full_name: data.full_name,
        phone: data.phone,
        status: "new",
        source: data.source ?? "application_page",
      })
      .select()
      .single();

    if (leadError || !lead) {
      console.error("Lead insert error:", leadError);
      return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
    }

    // Create application record
    const { error: appError } = await supabase.from("lead_applications").insert({
      lead_id: lead.id,
      coach_id: data.coach_id,
      goals: data.goals,
      experience_level: data.experience_level,
      availability: data.availability,
      budget_range: data.budget_range,
      health_notes: data.health_notes,
    });

    if (appError) {
      console.error("Application insert error:", appError);
      // Non-fatal: lead was created
    }

    return NextResponse.json({ success: true, lead_id: lead.id });
  } catch (err) {
    console.error("Apply route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
