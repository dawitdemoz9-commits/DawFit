import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import {
  ClipboardList,
  Dumbbell,
  CheckSquare,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Zap,
} from "lucide-react";

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

  // Parallel fetches
  const [
    { data: activeAssignment },
    { data: recentLogs },
    { data: lastCheckIn },
    { data: unreadMessages },
  ] = await Promise.all([
    supabase
      .from("program_assignments")
      .select("id, start_date, end_date, status, programs(title, duration_weeks)")
      .eq("client_id", user.id)
      .eq("status", "active")
      .order("assigned_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("workout_logs")
      .select("id, logged_at, status, overall_rpe, workouts(title)")
      .eq("client_id", user.id)
      .order("logged_at", { ascending: false })
      .limit(5),
    supabase
      .from("check_ins")
      .select("id, week_start_date, submitted_at")
      .eq("client_id", user.id)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("messages")
      .select("id", { count: "exact" })
      .is("read_at", null)
      .neq("sender_id", user.id)
      .limit(99),
  ]);

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";
  const activeProgram = Array.isArray(activeAssignment?.programs)
    ? activeAssignment.programs[0]
    : activeAssignment?.programs;

  const quickActions = [
    { href: "/client/log", label: "Log Workout", icon: Dumbbell, color: "text-blue-600", bg: "bg-blue-50" },
    { href: "/client/check-in", label: "Weekly Check-In", icon: CheckSquare, color: "text-violet-600", bg: "bg-violet-50" },
    { href: "/client/messages", label: "Message Coach", icon: MessageSquare, color: "text-emerald-600", bg: "bg-emerald-50" },
    { href: "/client/progress", label: "View Progress", icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Hey, {firstName}!</h1>
        <p className="text-slate-500 text-sm mt-0.5">Ready to put in the work?</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map(({ href, label, icon: Icon, color, bg }) => (
          <Link key={href} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                <div className={`p-2.5 rounded-lg ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <span className="text-sm font-medium text-slate-700">{label}</span>
                {label === "Message Coach" && (unreadMessages?.length ?? 0) > 0 && (
                  <Badge variant="default" className="text-xs">
                    {unreadMessages?.length}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Program */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-slate-500" />
                Active Program
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/client/program" className="text-xs">
                  View <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {activeAssignment && activeProgram ? (
              <div>
                <p className="font-semibold text-slate-900">{activeProgram.title}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                  <span>Started {formatDate(activeAssignment.start_date)}</span>
                  {activeProgram.duration_weeks && (
                    <span>{activeProgram.duration_weeks} weeks</span>
                  )}
                </div>
                <Badge variant="success" className="mt-3 text-xs">Active</Badge>
              </div>
            ) : (
              <div className="text-center py-6">
                <Zap className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No active program yet</p>
                <p className="text-xs text-slate-300 mt-1">Your coach will assign one soon</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Workouts */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-slate-500" />
                Recent Workouts
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/client/history" className="text-xs">
                  History <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {(!recentLogs || recentLogs.length === 0) ? (
              <div className="text-center py-6">
                <Dumbbell className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No workouts logged yet</p>
                <Button size="sm" variant="outline" className="mt-3" asChild>
                  <Link href="/client/log">Log your first workout</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentLogs.map((log) => {
                  const workout = Array.isArray(log.workouts) ? log.workouts[0] : log.workouts;
                  return (
                    <div key={log.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          {workout?.title ?? "Ad-hoc workout"}
                        </p>
                        <p className="text-xs text-slate-400">{formatRelativeTime(log.logged_at)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {log.overall_rpe && (
                          <span className="text-xs text-slate-500">RPE {log.overall_rpe}</span>
                        )}
                        <Badge
                          variant={log.status === "completed" ? "success" : "secondary"}
                          className="text-xs"
                        >
                          {log.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Last Check-in reminder */}
      {!lastCheckIn && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckSquare className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-amber-900">Weekly check-in due</p>
                <p className="text-xs text-amber-700">Help your coach track your progress</p>
              </div>
            </div>
            <Button size="sm" asChild className="bg-amber-600 hover:bg-amber-700">
              <Link href="/client/check-in">Check In Now</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
