import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProgressCharts } from "@/components/client/progress-charts";

export default async function ClientProgressPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: checkIns }, { data: workoutLogs }, { data: recentWorkouts }] = await Promise.all([
    // Weight + wellness over time
    supabase
      .from("check_ins")
      .select("week_start_date, weight, weight_unit, sleep_quality, stress_level, soreness_level")
      .eq("client_id", user.id)
      .order("week_start_date", { ascending: true })
      .limit(12),
    // Workout logs for volume calculation (last 30d)
    supabase
      .from("workout_logs")
      .select("id, logged_at, status, duration_min, overall_rpe")
      .eq("client_id", user.id)
      .eq("status", "completed")
      .gte("logged_at", thirtyDaysAgo)
      .order("logged_at", { ascending: true }),
    // Last 5 completed workouts for summary list
    supabase
      .from("workout_logs")
      .select("id, logged_at, duration_min, overall_rpe, workouts(title)")
      .eq("client_id", user.id)
      .eq("status", "completed")
      .order("logged_at", { ascending: false })
      .limit(5),
  ]);

  // Get set counts per workout log for volume chart
  const logIds = (workoutLogs ?? []).map(l => l.id);
  const { data: setCounts } = logIds.length > 0
    ? await supabase
        .from("exercise_logs")
        .select("workout_log_id")
        .in("workout_log_id", logIds)
    : { data: [] };

  // Compute sessions per week
  const weeklyVolume: Record<string, number> = {};
  for (const log of workoutLogs ?? []) {
    const weekStart = getWeekStart(log.logged_at);
    weeklyVolume[weekStart] = (weeklyVolume[weekStart] ?? 0) + 1;
  }

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

  const recentWorkoutsSummary = (recentWorkouts ?? []).map(log => {
    const workout = Array.isArray(log.workouts) ? log.workouts[0] : log.workouts;
    return {
      id: log.id,
      title: (workout as { title?: string } | null)?.title ?? "Workout",
      logged_at: log.logged_at,
      duration_min: log.duration_min ?? null,
      overall_rpe: log.overall_rpe ?? null,
    };
  });

  const totalSessions30d = workoutLogs?.length ?? 0;
  const avgRpe = workoutLogs && workoutLogs.length > 0
    ? workoutLogs.filter(l => l.overall_rpe).reduce((sum, l) => sum + (l.overall_rpe ?? 0), 0) /
      workoutLogs.filter(l => l.overall_rpe).length
    : null;

  const validWeights = weightData.slice(-2);
  const weightChange = validWeights.length === 2
    ? +(validWeights[1].weight - validWeights[0].weight).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-slate-900 p-5 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Progress</h1>
        <p className="text-slate-500 text-sm mt-1">Your trends over time</p>
      </div>

      <ProgressCharts
        weightData={weightData}
        wellnessData={wellnessData}
        weeklySessionData={weeklySessionData}
        recentWorkouts={recentWorkoutsSummary}
        totalSessions30d={totalSessions30d}
        avgRpe={avgRpe}
        weightChange={weightChange}
        weightUnit={weightData[0]?.unit ?? "lbs"}
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
