import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Dumbbell, ChevronRight } from "lucide-react";
import { startWorkoutLog } from "./actions";

export default async function LogWorkoutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Get active program assignment
  const { data: assignment } = await supabase
    .from("program_assignments")
    .select("id, program_id, start_date")
    .eq("client_id", user.id)
    .eq("status", "active")
    .order("assigned_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let weekWorkouts: { id: string; title: string; day_of_week: number | null; order_index: number }[] = [];
  if (assignment) {
    const startDate = new Date(assignment.start_date);
    const now = new Date();
    const weekNum = Math.max(1, Math.floor((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1);

    const { data: week } = await supabase
      .from("weeks")
      .select("id")
      .eq("program_id", assignment.program_id)
      .eq("week_number", weekNum)
      .maybeSingle();

    if (week) {
      const { data: workouts } = await supabase
        .from("workouts")
        .select("id, title, day_of_week, order_index")
        .eq("week_id", week.id)
        .eq("status", "published")
        .order("order_index");
      weekWorkouts = workouts ?? [];
    }
  }

  // Recent logs (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentLogs } = await supabase
    .from("workout_logs")
    .select("id, logged_at, status, workouts(title)")
    .eq("client_id", user.id)
    .gte("logged_at", sevenDaysAgo)
    .order("logged_at", { ascending: false })
    .limit(5);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Log Workout</h1>
        <p className="text-slate-500 text-sm mt-1">Track your sets, reps, and load</p>
      </div>

      {/* This week's workouts from active program */}
      {assignment && weekWorkouts.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            This Week&apos;s Program
          </h2>
          <div className="space-y-2">
            {weekWorkouts.map((workout) => (
              <form key={workout.id} action={async () => {
                "use server";
                const logId = await startWorkoutLog(workout.id, assignment.id);
                redirect(`/client/log/${logId}`);
              }}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors text-left group"
                >
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <Dumbbell className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">{workout.title}</p>
                    {workout.day_of_week !== null && (
                      <p className="text-sm text-slate-500">{days[workout.day_of_week]}</p>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </button>
              </form>
            ))}
          </div>
        </section>
      )}

      {!assignment && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
          <Dumbbell className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-600 font-medium">No active program</p>
          <p className="text-slate-500 text-sm mt-1">Ask your coach to assign a program to start tracking</p>
        </div>
      )}

      {/* Recent logs */}
      {recentLogs && recentLogs.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Recent Sessions
          </h2>
          <div className="space-y-2">
            {recentLogs.map((log) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const workout = log.workouts as unknown as { title: string } | null;
              return (
                <div key={log.id} className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl">
                  <div className={`h-2 w-2 rounded-full shrink-0 ${
                    log.status === "completed" ? "bg-green-500" :
                    log.status === "skipped" ? "bg-slate-300" : "bg-yellow-400"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {workout?.title ?? "Freeform Workout"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(log.logged_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    log.status === "completed" ? "bg-green-100 text-green-700" :
                    log.status === "skipped" ? "bg-slate-100 text-slate-500" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {log.status}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
