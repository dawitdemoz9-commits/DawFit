import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Sparkles, Clock, CheckCircle2, XCircle } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { GenerateProgramDialog } from "@/components/coach/generate-program-dialog";
import { GenerateWorkoutDialog } from "@/components/coach/generate-workout-dialog";

export default async function AIDraftsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: drafts }, { data: clients }] = await Promise.all([
    supabase
      .from("ai_drafts")
      .select("id, type, status, created_at, reviewed_at, client_id")
      .eq("coach_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("clients")
      .select("id, profiles(full_name)")
      .eq("coach_id", user.id)
      .eq("status", "active"),
  ]);

  const clientList = (clients ?? []).map(c => {
    const profile = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
    return { id: c.id, name: profile?.full_name ?? "Unnamed" };
  });

  const clientMap = new Map(clientList.map(c => [c.id, c.name]));

  const pending = (drafts ?? []).filter(d => d.status === "pending");
  const history = (drafts ?? []).filter(d => d.status !== "pending");

  const typeLabel: Record<string, string> = {
    program: "Program",
    workout: "Workout",
    adjustment_suggestion: "Suggestion",
    check_in_analysis: "Check-in Analysis",
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Assistant</h1>
          <p className="text-slate-500 text-sm mt-1">Generate programs and workouts — review before they go live</p>
        </div>
        <div className="flex gap-2">
          <GenerateWorkoutDialog />
          <GenerateProgramDialog clients={clientList} />
        </div>
      </div>

      {/* Pending drafts */}
      {pending.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            Needs Review ({pending.length})
          </h2>
          <div className="space-y-2">
            {pending.map(d => (
              <Link key={d.id} href={`/dashboard/ai/${d.id}`}
                className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl hover:border-amber-300 hover:bg-amber-100 transition-colors"
              >
                <div className="h-9 w-9 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm">
                    {typeLabel[d.type] ?? d.type}
                    {d.client_id && clientMap.has(d.client_id) && (
                      <span className="text-slate-500 font-normal"> — {clientMap.get(d.client_id)}</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-400">{formatRelativeTime(d.created_at)}</p>
                </div>
                <Badge variant="warning" className="text-xs">Review</Badge>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {(!drafts || drafts.length === 0) && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Sparkles className="h-12 w-12 text-slate-300 mb-4" />
          <h2 className="text-lg font-semibold text-slate-700">No AI drafts yet</h2>
          <p className="text-slate-400 text-sm mt-1 max-w-xs">
            Use the buttons above to generate a program or workout. You&apos;ll review it before anything is created.
          </p>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">History</h2>
          <div className="space-y-2">
            {history.map(d => (
              <div key={d.id} className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                  d.status === "approved" ? "bg-green-100" : "bg-slate-100"
                }`}>
                  {d.status === "approved"
                    ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                    : <XCircle className="h-4 w-4 text-slate-400" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700">
                    {typeLabel[d.type] ?? d.type}
                    {d.client_id && clientMap.has(d.client_id) && (
                      <span className="text-slate-400 font-normal"> — {clientMap.get(d.client_id)}</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-400">{formatRelativeTime(d.created_at)}</p>
                </div>
                <Badge variant={d.status === "approved" ? "success" : "secondary"} className="text-xs capitalize">
                  {d.status}
                </Badge>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
