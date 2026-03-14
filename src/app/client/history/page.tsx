import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Dumbbell, Clock, Flame, ArrowLeft, Calendar } from "lucide-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function ClientHistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: logs } = await supabase
    .from("workout_logs")
    .select("id, logged_at, status, overall_rpe, duration_min, notes, workouts(title)")
    .eq("client_id", user.id)
    .order("logged_at", { ascending: false })
    .limit(50);

  const completedCount = logs?.filter(l => l.status === "completed").length ?? 0;
  const totalDuration = logs?.reduce((sum, l) => sum + (l.duration_min ?? 0), 0) ?? 0;
  const avgRpe = logs && logs.length > 0
    ? (logs.filter(l => l.overall_rpe).reduce((s, l) => s + Number(l.overall_rpe ?? 0), 0) /
       logs.filter(l => l.overall_rpe).length)
    : null;

  return (
    <div className="min-h-screen bg-slate-900 p-5 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/client" className="text-slate-500 hover:text-slate-300 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Workout History</h1>
          <p className="text-slate-500 text-xs mt-0.5">{completedCount} sessions completed</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-white">{completedCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">Sessions</p>
        </div>
        <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-white">
            {totalDuration >= 60 ? `${Math.round(totalDuration / 60)}h` : `${totalDuration}m`}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Total Time</p>
        </div>
        <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-white">{avgRpe != null ? avgRpe.toFixed(1) : "—"}</p>
          <p className="text-xs text-slate-500 mt-0.5">Avg RPE</p>
        </div>
      </div>

      {/* Log list */}
      {(!logs || logs.length === 0) ? (
        <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-8 flex flex-col items-center text-center gap-3">
          <Dumbbell className="h-8 w-8 text-slate-600" />
          <p className="text-slate-400 text-sm">No workouts logged yet</p>
          <Link
            href="/client/log"
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Log your first workout →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => {
            const workout = Array.isArray(log.workouts) ? log.workouts[0] : log.workouts;
            const isDone = log.status === "completed";
            return (
              <div
                key={log.id}
                className="bg-slate-800 border border-slate-700/50 rounded-xl px-4 py-3 flex items-center gap-3"
              >
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isDone ? "bg-indigo-500/10" : "bg-slate-700"
                }`}>
                  <Dumbbell className={`h-4 w-4 ${isDone ? "text-indigo-400" : "text-slate-500"}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {(workout as { title?: string } | null)?.title ?? "Ad-hoc workout"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500">
                    <Calendar className="h-3 w-3" />
                    {formatDate(log.logged_at)}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-slate-500 flex-shrink-0">
                  {log.duration_min && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />{log.duration_min}m
                    </span>
                  )}
                  {log.overall_rpe && (
                    <span className="flex items-center gap-1 text-amber-400">
                      <Flame className="h-3 w-3" />RPE {log.overall_rpe}
                    </span>
                  )}
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                    isDone
                      ? "bg-emerald-500/10 text-emerald-400"
                      : log.status === "skipped"
                      ? "bg-slate-700 text-slate-500"
                      : "bg-amber-500/10 text-amber-400"
                  }`}>
                    {log.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
