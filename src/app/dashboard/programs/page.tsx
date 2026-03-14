import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, ClipboardList, Calendar } from "lucide-react";

export default async function ProgramsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: programs } = await supabase
    .from("programs")
    .select("id, title, description, status, duration_weeks, is_template, source, created_at")
    .eq("coach_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Programs</h1>
          <p className="text-slate-500 text-sm">{programs?.length ?? 0} programs</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/programs/new">
            <Plus className="h-4 w-4 mr-2" />New Program
          </Link>
        </Button>
      </div>

      {(!programs || programs.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
            <ClipboardList className="h-8 w-8 text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">Create your first training program</h2>
          <p className="text-slate-400 text-sm mt-1 max-w-sm">
            Build a multi-week training program and assign it to clients in minutes.
          </p>
          <Button className="mt-5" asChild>
            <Link href="/dashboard/programs/new"><Plus className="h-4 w-4 mr-2" />Build Program</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {programs.map((p) => (
            <Link key={p.id} href={`/dashboard/programs/${p.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-semibold text-slate-900">{p.title}</p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {p.source === "ai_approved" && (
                        <Badge variant="secondary" className="text-xs">AI</Badge>
                      )}
                      <Badge
                        variant={p.status === "active" ? "success" : p.status === "archived" ? "secondary" : "outline"}
                        className="text-xs capitalize"
                      >
                        {p.status}
                      </Badge>
                    </div>
                  </div>
                  {p.description && (
                    <p className="text-sm text-slate-500 line-clamp-2 mb-3">{p.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    {p.duration_weeks && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {p.duration_weeks} weeks
                      </span>
                    )}
                    {p.is_template && <Badge variant="outline" className="text-xs">Template</Badge>}
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
