import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProgressCharts } from "@/components/client/progress-charts";

export default async function ClientProgressPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: checkIns }, { data: workoutLogs }] = await Promise.all([
    // Weight + wellness over time
    supabase
      .from("check_ins")
      .select("week_start_date, weight, weight_unit, sleep_quality, stress_level, soreness_level")
      .eq("client_id", user.id)
      .order("week_start_date", { ascending: true })
      .limit(12),
    // Workout logs for volume calculation
    supabase
      .from("workout_logs")
      .select("id, logged_at, status, duration_min, overall_rpe")
      .eq("client_id", user.id)
      .eq("status", "completed")
      .gte("logged_at", thirtyDaysAgo)
      .order("logged_at", { ascending: true }),
  ]);

  // Get set counts per workout log for volume chart
  const logIds = (workoutLogs ?? []).map(l => l.id);
  const { data: setCounts } = logIds.length > 0
    ? await supabase
        .from("exercise_logs")
        .select("workout_log_id")
        .in("workout_log_id", logIds)
    : { data: [] };

  // Build weekly volume data (count sets per week)
  const weeklyVolume: Record<string, number> = {};
  for (const log of workoutLogs ?? []) {
    const weekStart = getWeekStart(log.logged_at);
    weeklyVolume[weekStart] = (weeklyVolume[weekStart] ?? 0) + 1;
  }

  // Count exercise logs per workout log
  const exerciseCountByLog: Record<string, number> = {};
  for (const el of setCounts ?? []) {
    exerciseCountByLog[el.workout_log_id] = (exerciseCountByLog[el.workout_log_id] ?? 0) + 1;
  }

  // Compute sessions per week
  const weeklySessionData = Object.entries(weeklyVolume).map(([week, count]) => ({
    week,
    sessions: count,
  })).sort((a, b) => a.week.localeCompare(b.week));

  const weightData = (checkIns ?? [])
    .filter(ci => ci.weight != null)
    .map(ci => ({
      date: ci.week_start_date,
      weight: ci.weight!,
      unit: ci.weight_unit ?? "lbs",
    }));

  const wellnessData = (checkIns ?? []).map(ci => ({
    date: ci.week_start_date,
    sleep: ci.sleep_quality,
    stress: ci.stress_level,
    soreness: ci.soreness_level,
  }));

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Progress</h1>
        <p className="text-slate-500 text-sm mt-1">Your trends over time</p>
      </div>

      <ProgressCharts
        weightData={weightData}
        wellnessData={wellnessData}
        weeklySessionData={weeklySessionData}
      />
    </div>
  );
}

function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}
