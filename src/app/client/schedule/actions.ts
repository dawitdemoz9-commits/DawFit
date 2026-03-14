"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const RequestSchema = z.object({
  scheduled_at: z.string().datetime(),
  type: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
});

export async function requestBooking(input: z.infer<typeof RequestSchema>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const parsed = RequestSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid booking request");

  const { data: client } = await supabase
    .from("clients")
    .select("coach_id")
    .eq("id", user.id)
    .single();

  if (!client) throw new Error("No coach assigned");

  // Load coach availability to get session duration
  const { data: slot } = await supabase
    .from("availability_slots")
    .select("slot_duration_min")
    .eq("coach_id", client.coach_id)
    .eq("is_active", true)
    .maybeSingle();

  await supabase.from("session_bookings").insert({
    coach_id: client.coach_id,
    client_id: user.id,
    scheduled_at: parsed.data.scheduled_at,
    duration_min: slot?.slot_duration_min ?? 60,
    type: parsed.data.type ?? "coaching",
    status: "pending",
    notes: parsed.data.notes ?? null,
  });

  revalidatePath("/client/schedule");
}

export async function cancelClientBooking(bookingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  await supabase
    .from("session_bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId)
    .eq("client_id", user.id)
    .in("status", ["pending"]); // clients can only cancel pending bookings

  revalidatePath("/client/schedule");
}
