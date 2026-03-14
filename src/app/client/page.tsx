import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils";
import {
  ClipboardList,
  Dumbbell,
  CheckSquare,
  MessageSquare,
  TrendingUp,
  Zap,
  ArrowRight,
  Clock,
  Flame,
} from "lucide-react";

function getDayContext() {
  const now = new Date();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return {
    dayName: days[now.getDay()],
    dateStr: `${months[now.getMonth()]} ${now.getDate()}`,
  };
}

export default async function ClientDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const { data: client } = await supabase
    .from("clients")
    .select("coach_id, status, goals")
    .eq("id", user.id)
    .single();

  if (!client) redirect("/auth/login");

  const [
    { data: activeAssignment },
    { data: recentLogs },
    { data: lastCheckIn },
    { data: latestCoachMessage },
    { count: unreadCount },
  ] = await Promise.all([
    supabase
      .from("program_assignments")
      .select("id, start_date, status, programs(title, duration_weeks)")
      .eq("client_id", user.id)
      .eq("status", "active")
      .order("assigned_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("workout_logs")
      .select("id, logged_at, status, overall_rpe, duration_min, workouts(title)")
      .eq("client_id", user.id)
      .order("logged_at", { ascending: false })
      .limit(3),
    supabase
      .from("check_ins")
      .select("id, submitted_at")
      .eq("client_id", user.id)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("messages")
      .select("id, body, sent_at")
      .is("read_at", null)
      .neq("sender_id", user.id)
      .order("sent_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .is("read_at", null)
      .neq("sender_id", user.id),
  ]);

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";
  const activeProgram = Array.isArray(activeAssignment?.programs)
    ? activeAssignment.programs[0]
    : activeAssignment?.programs;

  const { dayName, dateStr } = getDayContext();

  const quickActions = [
    { href: "/client/log", label: "Log Workout", icon: Dumbbell, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { href: "/client/check-in", label: "Check-In", icon: CheckSquare, color: "text-violet-400", bg: "bg-violet-500/10" },
    { href: "/client/messages", label: "Messages", icon: MessageSquare, color: "text-emerald-400", bg: "bg-emerald-500/10", badge: unreadCount ?? 0 },
    { href: "/client/progress", label: "Progress", icon: TrendingUp, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="min-h-screen bg-slate-900 p-5 space-y-5">
      {/* Greeting */}
      <div>
        <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
          {dayName} · {dateStr}
        </p>
        <h1 className="text-2xl font-bold text-white mt-0.5">Hey, {firstName}!</h1>
      </div>

      {/* Today's Focus */}
      {activeAssignment && activeProgram ? (
        <Link href="/client/program">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-5 flex items-center justify-between group hover:from-indigo-500 hover:to-indigo-600 transition-all cursor-pointer">
            <div>
              <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-1">Today&apos;s Focus</p>
              <p className="text-white font-bold text-lg leading-snug">{activeProgram.title}</p>
              {activeProgram.duration_weeks && (
                <p className="text-indigo-200 text-xs mt-1">{activeProgram.duration_weeks}-week program</p>
              )}
            </div>
            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
              <ArrowRight className="h-5 w-5 text-white" />
            </div>
          </div>
        </Link>
      ) : (
        <div className="rounded-2xl bg-slate-800 border border-slate-700/50 p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
            <Zap className="h-5 w-5 text-slate-500" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">No active program yet</p>
            <p className="text-slate-500 text-xs mt-0.5">Your coach will assign one soon</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2.5">
        {quickActions.map(({ href, label, icon: Icon, color, bg, badge }) => (
          <Link key={href} href={href}>
            <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-3 flex flex-col items-center text-center gap-2 hover:border-slate-600 transition-colors cursor-pointer">
              <div className={`p-2 rounded-lg ${bg} relative`}>
                <Icon className={`h-5 w-5 ${color}`} />
                {badge && badge > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium text-slate-300 leading-tight">{label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Coach Message Preview */}
      {latestCoachMessage && (
        <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-emerald-400" />
              <p className="text-sm font-semibold text-white">New message from your coach</p>
            </div>
            <p className="text-xs text-slate-500">{formatRelativeTime(latestCoachMessage.sent_at)}</p>
          </div>
          <p className="text-sm text-slate-400 line-clamp-2 mb-3">{latestCoachMessage.body}</p>
          <Button size="sm" asChild className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
            <Link href="/client/messages">Reply to Coach</Link>
          </Button>
        </div>
      )}

      {/* Recent Sessions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-white flex items-center gap-2">
            <Dumbbell className="h-4 w-4 text-slate-500" />
            Recent Sessions
          </p>
          <Link href="/client/history" className="text-xs text-indigo-400 hover:text-indigo-300">
            See all
          </Link>
        </div>
        {(!recentLogs || recentLogs.length === 0) ? (
          <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-5 flex flex-col items-center text-center gap-2">
            <Dumbbell className="h-7 w-7 text-slate-600" />
            <p className="text-sm text-slate-400">No workouts logged yet</p>
            <Button size="sm" asChild className="h-7 text-xs mt-1 bg-indigo-600 hover:bg-indigo-700">
              <Link href="/client/log">Log your first workout</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentLogs.map((log) => {
              const workout = Array.isArray(log.workouts) ? log.workouts[0] : log.workouts;
              return (
                <div key={log.id} className="bg-slate-800 border border-slate-700/50 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                      <Dumbbell className="h-4 w-4 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{workout?.title ?? "Ad-hoc workout"}</p>
                      <p className="text-xs text-slate-500">{formatRelativeTime(log.logged_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-500">
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
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Check-in reminder */}
      {!lastCheckIn && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckSquare className="h-5 w-5 text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-200">Weekly check-in due</p>
              <p className="text-xs text-amber-400/80">Help your coach track your progress</p>
            </div>
          </div>
          <Button size="sm" asChild className="h-7 text-xs bg-amber-500 hover:bg-amber-600 text-white flex-shrink-0">
            <Link href="/client/check-in">Check In</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
