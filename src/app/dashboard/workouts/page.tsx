import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Dumbbell, Clock } from "lucide-react";

export default async function WorkoutsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: workouts } = await supabase
    .from("workouts")
    .select("id, title, description, status, estimated_duration_min, is_template")
    .eq("coach_id", user.id)
    .is("week_id", null) // standalone workouts only (not program-embedded)
    .order("title");

  const published = workouts?.filter(w => w.status === "published") ?? [];
  const drafts = workouts?.filter(w => w.status === "draft") ?? [];

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Workouts</h1>
          <p className="text-slate-500 text-sm">
            {published.length} published · {drafts.length} drafts
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/workouts/new">
            <Plus className="h-4 w-4 mr-2" />New Workout
          </Link>
        </Button>
      </div>

      {(!workouts || workouts.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Dumbbell className="h-12 w-12 text-slate-300 mb-4" />
          <h2 className="text-lg font-semibold text-slate-700">No workouts yet</h2>
          <p className="text-slate-400 text-sm mt-1 max-w-sm">
            Build standalone workouts or create them inside a program
          </p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard/workouts/new"><Plus className="h-4 w-4 mr-2" />Build Workout</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {workouts.map((w) => (
            <Link key={w.id} href={`/dashboard/workouts/${w.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-semibold text-slate-900">{w.title}</p>
                    <Badge
                      variant={w.status === "published" ? "success" : "secondary"}
                      className="text-xs flex-shrink-0"
                    >
                      {w.status}
                    </Badge>
                  </div>
                  {w.description && (
                    <p className="text-sm text-slate-500 line-clamp-2 mb-3">{w.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    {w.estimated_duration_min && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {w.estimated_duration_min} min
                      </span>
                    )}
                    {w.is_template && <Badge variant="outline" className="text-xs">Template</Badge>}
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
