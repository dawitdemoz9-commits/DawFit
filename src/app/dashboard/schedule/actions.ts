"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const AvailabilitySchema = z.object({
  days: z.array(z.number().int().min(0).max(6)),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
  slot_duration_min: z.number().int().min(15).max(240),
});

export async function saveAvailability(input: z.infer<typeof AvailabilitySchema>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const parsed = AvailabilitySchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid availability data");

  const { days, start_time, end_time, slot_duration_min } = parsed.data;

  // Delete existing slots and replace with new one
  await supabase.from("availability_slots").delete().eq("coach_id", user.id);

  if (days.length > 0) {
    await supabase.from("availability_slots").insert({
      coach_id: user.id,
      day_of_week: days,
      start_time,
      end_time,
      slot_duration_min,
      is_active: true,
    });
  }

  revalidatePath("/dashboard/schedule");
}

export async function confirmBooking(bookingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  await supabase
    .from("session_bookings")
    .update({ status: "confirmed" })
    .eq("id", bookingId)
    .eq("coach_id", user.id);

  revalidatePath("/dashboard/schedule");
}

export async function cancelBooking(bookingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  await supabase
    .from("session_bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId)
    .eq("coach_id", user.id);

  revalidatePath("/dashboard/schedule");
}

export async function completeBooking(bookingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  await supabase
    .from("session_bookings")
    .update({ status: "completed" })
    .eq("id", bookingId)
    .eq("coach_id", user.id);

  revalidatePath("/dashboard/schedule");
}

export async function saveMeetingUrl(bookingId: string, meetingUrl: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  await supabase
    .from("session_bookings")
    .update({ meeting_url: meetingUrl })
    .eq("id", bookingId)
    .eq("coach_id", user.id);

  revalidatePath("/dashboard/schedule");
}
