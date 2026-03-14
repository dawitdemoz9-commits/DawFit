import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExerciseSearch } from "@/components/coach/exercise-search";
import { BulkExerciseDialog } from "@/components/coach/bulk-exercise-dialog";
import { Plus, Dumbbell, Sparkles } from "lucide-react";

const CATEGORIES = ["strength", "cardio", "core", "mobility", "plyometrics", "other"];

interface Props {
  searchParams: Promise<{ q?: string; category?: string; source?: string }>;
}

export default async function ExercisesPage({ searchParams }: Props) {
  const { q, category, source } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  let query = supabase
    .from("exercises")
    .select("id, name, category, muscle_groups, equipment, coach_id, is_public")
    .order("name");

  // Filter by source: "mine" = coach-owned, "platform" = defaults (coach_id IS NULL)
  if (source === "mine") {
    query = query.eq("coach_id", user.id);
  } else if (source === "platform") {
    query = query.is("coach_id", null);
  } else {
    // All: coach's own + platform defaults
    query = query.or(`coach_id.eq.${user.id},coach_id.is.null`);
  }

  if (category) query = query.eq("category", category);
  if (q) query = query.ilike("name", `%${q}%`);

  const { data: exercises } = await query.limit(200);

  const myCount = exercises?.filter(e => e.coach_id === user.id).length ?? 0;
  const platformCount = exercises?.filter(e => e.coach_id === null).length ?? 0;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Exercise Library</h1>
          <p className="text-slate-500 text-sm">
            {myCount} custom · {platformCount} platform defaults
          </p>
        </div>
        <div className="flex gap-2">
          <BulkExerciseDialog />
          <Button asChild>
            <Link href="/dashboard/exercises/new">
              <Plus className="h-4 w-4 mr-2" />
              New Exercise
            </Link>
          </Button>
        </div>
      </div>

      <ExerciseSearch categories={CATEGORIES} />

      {(!exercises || exercises.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Dumbbell className="h-12 w-12 text-slate-300 mb-4" />
          <h2 className="text-lg font-semibold text-slate-700">No exercises found</h2>
          <p className="text-slate-400 text-sm mt-1 max-w-sm">
            {q || category
              ? "Try a different search or filter."
              : "Build your library fast — let AI generate exercises by category, or add them manually."}
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-5">
            <BulkExerciseDialog />
            <Button variant="outline" asChild>
              <Link href="/dashboard/exercises/new">
                <Plus className="h-4 w-4 mr-2" />Add Manually
              </Link>
            </Button>
          </div>
          {!q && !category && (
            <p className="text-slate-300 text-xs mt-4 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Tip: AI can generate 10–50 exercises at once by category and focus
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {exercises.map((ex) => (
            <Link key={ex.id} href={`/dashboard/exercises/${ex.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">{ex.name}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {ex.category && (
                          <Badge variant="secondary" className="text-xs capitalize">{ex.category}</Badge>
                        )}
                        {(ex.muscle_groups ?? []).slice(0, 2).map((m) => (
                          <Badge key={m} variant="outline" className="text-xs capitalize">{m.replace("_", " ")}</Badge>
                        ))}
                      </div>
                    </div>
                    {ex.coach_id === null && (
                      <Badge variant="secondary" className="text-xs flex-shrink-0 text-slate-400">Platform</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
