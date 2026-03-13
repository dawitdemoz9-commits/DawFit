"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const CheckInSchema = z.object({
  week_start_date: z.string(),
  sleep_quality: z.coerce.number().min(1).max(5),
  stress_level: z.coerce.number().min(1).max(5),
  soreness_level: z.coerce.number().min(1).max(5),
  weight: z.coerce.number().positive().optional().nullable(),
  weight_unit: z.enum(["kg", "lbs"]).optional(),
  notes: z.string().max(1000).optional(),
});

export async function submitCheckIn(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: client } = await supabase
    .from("clients")
    .select("coach_id")
    .eq("id", user.id)
    .single();
  if (!client) throw new Error("Client record not found");

  const raw = {
    week_start_date: formData.get("week_start_date") as string,
    sleep_quality: formData.get("sleep_quality"),
    stress_level: formData.get("stress_level"),
    soreness_level: formData.get("soreness_level"),
    weight: formData.get("weight") || null,
    weight_unit: formData.get("weight_unit") as string || "lbs",
    notes: formData.get("notes") as string || undefined,
  };

  const parsed = CheckInSchema.safeParse(raw);
  if (!parsed.success) throw new Error("Invalid check-in data");

  // Check for duplicate this week
  const { data: existing } = await supabase
    .from("check_ins")
    .select("id")
    .eq("client_id", user.id)
    .eq("week_start_date", parsed.data.week_start_date)
    .maybeSingle();

  if (existing) {
    // Update existing
    await supabase
      .from("check_ins")
      .update({
        sleep_quality: parsed.data.sleep_quality,
        stress_level: parsed.data.stress_level,
        soreness_level: parsed.data.soreness_level,
        weight: parsed.data.weight ?? null,
        weight_unit: parsed.data.weight_unit ?? "lbs",
        notes: parsed.data.notes ?? null,
        submitted_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("check_ins").insert({
      client_id: user.id,
      coach_id: client.coach_id,
      week_start_date: parsed.data.week_start_date,
      sleep_quality: parsed.data.sleep_quality,
      stress_level: parsed.data.stress_level,
      soreness_level: parsed.data.soreness_level,
      weight: parsed.data.weight ?? null,
      weight_unit: parsed.data.weight_unit ?? "lbs",
      notes: parsed.data.notes ?? null,
    });
  }

  revalidatePath("/client");
  redirect("/client");
}

export async function reviewCheckIn(checkInId: string, coachNotes: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  await supabase
    .from("check_ins")
    .update({
      reviewed_at: new Date().toISOString(),
      coach_notes: coachNotes,
    })
    .eq("id", checkInId)
    .eq("coach_id", user.id);

  revalidatePath("/dashboard/clients");
}
