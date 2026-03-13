import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ExerciseForm } from "@/components/coach/exercise-form";
import { DeleteExerciseButton } from "@/components/coach/delete-exercise-button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Exercise } from "@/types/database";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ExerciseDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: exercise } = await supabase
    .from("exercises")
    .select("*")
    .eq("id", id)
    .single();

  if (!exercise) notFound();

  const isOwned = exercise.coach_id === user.id;
  const isPlatform = exercise.coach_id === null;

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/exercises" className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">{exercise.name}</h1>
            {isPlatform && <Badge variant="secondary" className="text-xs">Platform Default</Badge>}
          </div>
          {exercise.category && (
            <p className="text-slate-500 text-sm capitalize">{exercise.category}</p>
          )}
        </div>
        {isOwned && <DeleteExerciseButton id={id} />}
      </div>

      {isPlatform ? (
        // Read-only view for platform exercises
        <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
          {exercise.description && (
            <div>
              <p className="text-sm font-medium text-slate-700 mb-1">Description</p>
              <p className="text-slate-600 text-sm">{exercise.description}</p>
            </div>
          )}
          {exercise.instructions && (
            <div>
              <p className="text-sm font-medium text-slate-700 mb-1">Instructions</p>
              <p className="text-slate-600 text-sm whitespace-pre-wrap">{exercise.instructions}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-1">
            {(exercise.muscle_groups ?? []).map((m) => (
              <Badge key={m} variant="outline" className="text-xs capitalize">{m.replace("_", " ")}</Badge>
            ))}
            {(exercise.equipment ?? []).map((e) => (
              <Badge key={e} variant="secondary" className="text-xs capitalize">{e.replace("_", " ")}</Badge>
            ))}
          </div>
          <p className="text-xs text-slate-400">Platform exercises cannot be edited. Create a custom exercise to override.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <ExerciseForm exercise={exercise as Exercise} />
        </div>
      )}
    </div>
  );
}
