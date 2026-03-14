import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProgramBuilder } from "@/components/coach/program-builder";
import { AssignProgramDialog } from "@/components/coach/assign-program-dialog";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProgramDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: program }, { data: weeks }, { data: clients }, { data: libraryWorkouts }] = await Promise.all([
    supabase.from("programs").select("*").eq("id", id).eq("coach_id", user.id).single(),
    supabase
      .from("weeks")
      .select("id, week_number, label, notes")
      .eq("program_id", id)
      .order("week_number"),
    supabase
      .from("clients")
      .select("id, status, profiles(full_name)")
      .eq("coach_id", user.id)
      .eq("status", "active"),
    supabase
      .from("workouts")
      .select("id, title, estimated_duration_min, status")
      .eq("coach_id", user.id)
      .is("week_id", null)
      .order("title"),
  ]);

  if (!program) notFound();

  // Fetch workouts for each week
  const weekIds = (weeks ?? []).map(w => w.id);
  const { data: allWorkouts } = weekIds.length > 0
    ? await supabase
        .from("workouts")
        .select("id, title, week_id, day_of_week, order_index, status, estimated_duration_min")
        .in("week_id", weekIds)
        .order("order_index")
    : { data: [] };

  // Count workout_exercises per workout
  const workoutIds = (allWorkouts ?? []).map(w => w.id);
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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b bg-white flex-shrink-0">
        <Link href="/dashboard/programs" className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-slate-900 truncate">{program.title}</h1>
            <Badge
              variant={program.status === "active" ? "success" : program.status === "archived" ? "secondary" : "outline"}
              className="text-xs capitalize"
            >
              {program.status}
            </Badge>
            {program.duration_weeks && (
              <span className="text-sm text-slate-400">{program.duration_weeks} weeks</span>
            )}
          </div>
        </div>
        <AssignProgramDialog
          programId={id}
          clients={(clients ?? []).map(c => ({
            id: c.id,
            name: (Array.isArray(c.profiles) ? c.profiles[0] : c.profiles)?.full_name ?? "Unnamed",
          }))}
        />
      </div>

      {/* Program Builder */}
      <div className="flex-1 overflow-y-auto">
        <ProgramBuilder
          program={program}
          weeks={weeks ?? []}
          workouts={allWorkouts ?? []}
          exerciseCountMap={exerciseCountMap}
          libraryWorkouts={libraryWorkouts ?? []}
        />
      </div>
    </div>
  );
}
