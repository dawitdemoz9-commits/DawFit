import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { WorkoutBuilder } from "@/components/coach/workout-builder";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function WorkoutBuilderPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: workout }, { data: workoutExercises }, { data: allExercises }] = await Promise.all([
    supabase.from("workouts").select("*").eq("id", id).eq("coach_id", user.id).single(),
    supabase
      .from("workout_exercises")
      .select("*, exercises(id, name, category, muscle_groups)")
      .eq("workout_id", id)
      .order("order_index"),
    supabase
      .from("exercises")
      .select("id, name, category, muscle_groups")
      .or(`coach_id.eq.${user.id},coach_id.is.null`)
      .order("name")
      .limit(500),
  ]);

  if (!workout) notFound();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b bg-white">
        <Link href="/dashboard/workouts" className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-slate-900 truncate">{workout.title}</h1>
            <Badge variant={workout.status === "published" ? "success" : "secondary"} className="text-xs">
              {workout.status}
            </Badge>
          </div>
          {workout.description && (
            <p className="text-sm text-slate-500 truncate">{workout.description}</p>
          )}
        </div>
      </div>

      {/* Builder */}
      <div className="flex-1 overflow-hidden">
        <WorkoutBuilder
          workout={workout}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          initialExercises={(workoutExercises ?? []) as any[]}
          allExercises={allExercises ?? []}
        />
      </div>
    </div>
  );
}
