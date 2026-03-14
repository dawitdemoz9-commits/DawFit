import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ScheduleCoach } from "@/components/coach/schedule-coach";

export default async function SchedulePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [
    { data: bookings },
    { data: availability },
    { data: clients },
  ] = await Promise.all([
    supabase
      .from("session_bookings")
      .select("id, client_id, scheduled_at, duration_min, type, status, notes, meeting_url")
      .eq("coach_id", user.id)
      .in("status", ["pending", "confirmed"])
      .order("scheduled_at", { ascending: true }),
    supabase
      .from("availability_slots")
      .select("id, day_of_week, start_time, end_time, slot_duration_min, is_active")
      .eq("coach_id", user.id)
      .eq("is_active", true)
      .maybeSingle(),
    supabase
      .from("clients")
      .select("id, profiles(full_name)")
      .eq("coach_id", user.id)
      .eq("status", "active"),
  ]);

  const clientMap: Record<string, string> = {};
  for (const c of (clients ?? [])) {
    const p = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
    clientMap[c.id] = (p as { full_name: string | null } | null)?.full_name ?? "Client";
  }

  const enrichedBookings = (bookings ?? []).map(b => ({
    ...b,
    client_name: clientMap[b.client_id] ?? "Client",
  }));

  return (
    <ScheduleCoach
      bookings={enrichedBookings}
      availability={availability ?? null}
    />
  );
}
