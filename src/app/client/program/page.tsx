import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Dumbbell, Clock, ChevronRight, Zap } from "lucide-react";

export default async function ClientProgramPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: assignment } = await supabase
    .from("program_assignments")
    .select("id, start_date, end_date, status, programs(id, title, description, duration_weeks)")
    .eq("client_id", user.id)
    .eq("status", "active")
    .order("assigned_at", { ascending: false })
    .limit(1)
    .single();

  if (!assignment) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-20 text-center">
        <Zap className="h-12 w-12 text-slate-300 mb-4" />
        <h2 className="text-lg font-semibold text-slate-700">No active program</h2>
        <p className="text-slate-400 text-sm mt-1">Your coach will assign a program soon.</p>
      </div>
    );
  }

  const program = Array.isArray(assignment.programs) ? assignment.programs[0] : assignment.programs;

  const { data: weeks } = await supabase
    .from("weeks")
    .select("id, week_number, label")
    .eq("program_id", program?.id ?? "")
    .order("week_number");

  const weekIds = (weeks ?? []).map(w => w.id);
  const { data: workouts } = weekIds.length > 0
    ? await supabase
        .from("workouts")
        .select("id, title, week_id, day_of_week, order_index, estimated_duration_min, status")
        .in("week_id", weekIds)
        .eq("status", "published")
        .order("order_index")
    : { data: [] };

  // Workout exercise counts
  const workoutIds = (workouts ?? []).map(w => w.id);
  const { data: exerciseCounts } = workoutIds.length > 0
    ? await supabase
        .from("workout_exercises")
        .select("workout_id")
        .in("workout_id", workoutIds)
    : { data: [] };

  const exerciseCountMap = (exerciseCounts ?? []).reduce((acc: Record<string, number>, row) => {
    acc[row.workout_id] = (acc[row.workout_id] ?? 0) + 1;
    return acc;
  }, {});

  // Calculate current week
  const startDate = new Date(assignment.start_date);
  const today = new Date();
  const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const currentWeekNum = Math.max(1, Math.ceil((daysDiff + 1) / 7));

  const DAY_LABELS = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="p-6 space-y-6">
      {/* Program header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{program?.title}</h1>
        <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
          <span>Started {formatDate(assignment.start_date)}</span>
          {assignment.end_date && <span>Ends {formatDate(assignment.end_date)}</span>}
          {program?.duration_weeks && <span>Week {currentWeekNum} of {program.duration_weeks}</span>}
        </div>
        {program?.description && (
          <p className="text-slate-500 mt-2 text-sm">{program.description}</p>
        )}
      </div>

      {/* Progress bar */}
      {program?.duration_weeks && (
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>Progress</span>
            <span>{Math.min(100, Math.round((currentWeekNum / program.duration_weeks) * 100))}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${Math.min(100, (currentWeekNum / program.duration_weeks) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Weeks */}
      <div className="space-y-4">
        {(weeks ?? []).map((week) => {
          const weekWorkouts = (workouts ?? []).filter(w => w.week_id === week.id);
          const isCurrent = week.week_number === currentWeekNum;

          return (
            <Card key={week.id} className={isCurrent ? "ring-2 ring-primary ring-offset-1" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    {week.label ?? `Week ${week.week_number}`}
                    {isCurrent && <Badge variant="default" className="text-xs">Current Week</Badge>}
                  </CardTitle>
                  <span className="text-sm text-slate-400">{weekWorkouts.length} workouts</span>
                </div>
              </CardHeader>
              <CardContent>
                {weekWorkouts.length === 0 ? (
                  <p className="text-slate-400 text-sm">No workouts scheduled</p>
                ) : (
                  <div className="space-y-2">
                    {weekWorkouts.map((wo) => (
                      <Link
                        key={wo.id}
                        href={`/client/program/${week.id}/workout/${wo.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors group"
                      >
                        {wo.day_of_week && (
                          <Badge variant="secondary" className="text-xs w-10 justify-center flex-shrink-0">
                            {DAY_LABELS[wo.day_of_week]}
                          </Badge>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 text-sm">{wo.title}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                            {exerciseCountMap[wo.id] !== undefined && (
                              <span className="flex items-center gap-1">
                                <Dumbbell className="h-2.5 w-2.5" />
                                {exerciseCountMap[wo.id]} exercises
                              </span>
                            )}
                            {wo.estimated_duration_min && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" />
                                {wo.estimated_duration_min} min
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
