import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClientSchedule } from "@/components/client/client-schedule";

export default async function ClientSchedulePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: client } = await supabase
    .from("clients")
    .select("coach_id")
    .eq("id", user.id)
    .single();

  if (!client) redirect("/auth/login");

  const [{ data: bookings }, { data: availability }] = await Promise.all([
    supabase
      .from("session_bookings")
      .select("id, scheduled_at, duration_min, type, status, notes, meeting_url")
      .eq("client_id", user.id)
      .not("status", "in", '("cancelled","completed")')
      .order("scheduled_at", { ascending: true }),
    supabase
      .from("availability_slots")
      .select("day_of_week, start_time, end_time, slot_duration_min")
      .eq("coach_id", client.coach_id)
      .eq("is_active", true)
      .maybeSingle(),
  ]);

  return (
    <ClientSchedule
      bookings={(bookings ?? []) as Array<{
        id: string;
        scheduled_at: string;
        duration_min: number;
        type: string | null;
        status: "pending" | "confirmed" | "completed" | "cancelled";
        notes: string | null;
        meeting_url: string | null;
      }>}
      availability={availability ?? null}
    />
  );
}
