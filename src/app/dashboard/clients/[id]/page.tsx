import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { ArrowLeft, Dumbbell, ClipboardList, CheckSquare, MessageSquare } from "lucide-react";
import { ClientStatusActions } from "@/components/coach/client-status-actions";
import { ReviewCheckInDialog } from "@/components/coach/review-check-in-dialog";
import { AdaptiveSuggestionsPanel } from "@/components/coach/adaptive-suggestions-panel";
import { TransformationStudio } from "@/components/coach/transformation-studio";
import { ResendInviteButton } from "@/components/coach/resend-invite-button";
import type { AdaptiveAnalysisOutput } from "@/lib/ai/adaptive-prompts";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function ClientDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { tab = "overview" } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fetch client + profile in one query
  const { data: client } = await supabase
    .from("clients")
    .select("*, profiles(full_name, avatar_url)")
    .eq("id", id)
    .eq("coach_id", user.id)
    .single();

  if (!client) notFound();

  const profile = Array.isArray(client.profiles) ? client.profiles[0] : client.profiles;

  // Get client email + confirmed status from auth
  const admin = createAdminClient();
  const { data: authUser } = await admin.auth.admin.getUserById(id);
  const clientEmail = authUser?.user?.email ?? null;
  const clientConfirmed = !!authUser?.user?.confirmed_at;

  // Parallel fetch based on tab
  const [
    { data: activeAssignment },
    { data: recentLogs },
    { data: recentCheckIns },
    { data: allPrograms },
    { data: aiDrafts },
    { data: adaptiveSuggestions },
    { data: transformation },
    { data: coach },
  ] = await Promise.all([
    supabase
      .from("program_assignments")
      .select("id, start_date, end_date, status, programs(title, duration_weeks)")
      .eq("client_id", id)
      .eq("status", "active")
      .limit(1)
      .single(),
    supabase
      .from("workout_logs")
      .select("id, logged_at, status, overall_rpe, duration_min, workouts(title)")
      .eq("client_id", id)
      .order("logged_at", { ascending: false })
      .limit(10),
    supabase
      .from("check_ins")
      .select("id, week_start_date, submitted_at, sleep_quality, stress_level, soreness_level, weight, reviewed_at, coach_notes")
      .eq("client_id", id)
      .order("submitted_at", { ascending: false })
      .limit(10),
    supabase
      .from("program_assignments")
      .select("id, start_date, status, programs(title)")
      .eq("client_id", id)
      .order("assigned_at", { ascending: false })
      .limit(20),
    supabase
      .from("ai_drafts")
      .select("id, created_at, parsed_content")
      .eq("client_id", id)
      .eq("coach_id", user.id)
      .eq("type", "adjustment_suggestion")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("adaptive_suggestions")
      .select("id, ai_draft_id, suggestion_type, target_week, rationale, status")
      .eq("client_id", id)
      .eq("coach_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("transformations")
      .select("id, before_photo_url, after_photo_url, testimonial, share_token, is_public")
      .eq("client_id", id)
      .maybeSingle(),
    supabase
      .from("coaches")
      .select("slug")
      .eq("id", user.id)
      .single(),
  ]);

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "programs", label: "Programs" },
    { key: "logs", label: "Workout Logs" },
    { key: "checkins", label: "Check-ins" },
    { key: "ai", label: "AI Suggestions" },
    { key: "transformation", label: "Transformation" },
  ];

  const existingDrafts = (aiDrafts ?? []).map(d => ({
    id: d.id,
    created_at: d.created_at,
    output: d.parsed_content as unknown as AdaptiveAnalysisOutput,
  }));

  const pendingSuggestions = (adaptiveSuggestions ?? []).map(s => ({
    id: s.id,
    ai_draft_id: s.ai_draft_id,
    suggestion_type: s.suggestion_type as import("@/lib/ai/adaptive-prompts").SuggestionType,
    target_week: s.target_week,
    rationale: s.rationale,
    status: s.status,
  }));

  const activeProgram = Array.isArray(activeAssignment?.programs) ? activeAssignment.programs[0] : activeAssignment?.programs;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-white">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/dashboard/clients" className="text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3 flex-1">
            <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600 flex-shrink-0">
              {(profile?.full_name ?? "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">{profile?.full_name ?? "Unnamed Client"}</h1>
              <div className="flex items-center gap-2">
                <Badge
                  variant={client.status === "active" ? "success" : client.status === "paused" ? "warning" : "secondary"}
                  className="text-xs"
                >
                  {client.status}
                </Badge>
                {activeProgram && (
                  <span className="text-xs text-slate-400">on {activeProgram.title}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!clientConfirmed && clientEmail && (
              <ResendInviteButton clientId={id} email={clientEmail} />
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/messages?client=${id}`}>
                <MessageSquare className="h-4 w-4 mr-1.5" />Message
              </Link>
            </Button>
            <ClientStatusActions clientId={id} currentStatus={client.status} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {tabs.map(t => (
            <Link
              key={t.key}
              href={`/dashboard/clients/${id}?tab=${t.key}`}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                tab === t.key
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-6">
        {tab === "overview" && (
          <div className="space-y-5 max-w-2xl">
            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Workouts logged", value: recentLogs?.length ?? 0, icon: Dumbbell },
                { label: "Check-ins", value: recentCheckIns?.length ?? 0, icon: CheckSquare },
                { label: "Active program", value: activeProgram ? "Yes" : "None", icon: ClipboardList },
              ].map(({ label, value, icon: Icon }) => (
                <Card key={label}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Icon className="h-3.5 w-3.5" />
                      <span className="text-xs">{label}</span>
                    </div>
                    <p className="text-xl font-bold text-slate-900">{value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Goals */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Goals & Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Client goals</p>
                  <p className="text-sm text-slate-700">{client.goals ?? "Not set"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Coach notes (private)</p>
                  <p className="text-sm text-slate-700">{client.notes ?? "No notes"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent activity */}
            {(recentLogs?.length ?? 0) > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Recent Workouts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(recentLogs ?? []).slice(0, 5).map(log => {
                      const workout = Array.isArray(log.workouts) ? log.workouts[0] : log.workouts;
                      return (
                        <div key={log.id} className="flex items-center justify-between text-sm">
                          <span className="text-slate-700">{workout?.title ?? "Ad-hoc"}</span>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            {log.overall_rpe && <span>RPE {log.overall_rpe}</span>}
                            <span>{formatRelativeTime(log.logged_at)}</span>
                            <Badge variant={log.status === "completed" ? "success" : "secondary"} className="text-xs">
                              {log.status}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {tab === "programs" && (
          <div className="space-y-4 max-w-2xl">
            {(!allPrograms || allPrograms.length === 0) ? (
              <p className="text-slate-400 text-sm text-center py-10">No programs assigned yet</p>
            ) : (
              allPrograms.map(a => {
                const prog = Array.isArray(a.programs) ? a.programs[0] : a.programs;
                return (
                  <Card key={a.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{prog?.title ?? "Unknown"}</p>
                        <p className="text-xs text-slate-400">Started {formatDate(a.start_date)}</p>
                      </div>
                      <Badge variant={a.status === "active" ? "success" : "secondary"} className="text-xs capitalize">
                        {a.status}
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {tab === "logs" && (
          <div className="space-y-3 max-w-2xl">
            {(!recentLogs || recentLogs.length === 0) ? (
              <p className="text-slate-400 text-sm text-center py-10">No workouts logged yet</p>
            ) : (
              recentLogs.map(log => {
                const workout = Array.isArray(log.workouts) ? log.workouts[0] : log.workouts;
                return (
                  <Card key={log.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{workout?.title ?? "Ad-hoc workout"}</p>
                          <p className="text-xs text-slate-400">{formatDate(log.logged_at)}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          {log.duration_min && <span>{log.duration_min} min</span>}
                          {log.overall_rpe && <span>RPE {log.overall_rpe}/10</span>}
                          <Badge variant={log.status === "completed" ? "success" : "secondary"} className="text-xs capitalize">
                            {log.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {tab === "checkins" && (
          <div className="space-y-3 max-w-2xl">
            {(!recentCheckIns || recentCheckIns.length === 0) ? (
              <p className="text-slate-400 text-sm text-center py-10">No check-ins submitted yet</p>
            ) : (
              recentCheckIns.map(ci => (
                <Card key={ci.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-slate-900 text-sm">
                          Week of {formatDate(ci.week_start_date)}
                        </p>
                        <p className="text-xs text-slate-400">Submitted {formatRelativeTime(ci.submitted_at)}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-600">
                          {ci.sleep_quality && <span>😴 Sleep: {ci.sleep_quality}/5</span>}
                          {ci.stress_level && <span>😤 Stress: {ci.stress_level}/5</span>}
                          {ci.soreness_level && <span>💪 Soreness: {ci.soreness_level}/5</span>}
                          {ci.weight && <span>⚖️ {ci.weight} lbs</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {ci.reviewed_at ? (
                          <Badge variant="success" className="text-xs">Reviewed</Badge>
                        ) : (
                          <Badge variant="warning" className="text-xs">Needs Review</Badge>
                        )}
                        <ReviewCheckInDialog checkInId={ci.id} existingNotes={ci.coach_notes} />
                      </div>
                    </div>
                    {ci.coach_notes && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-slate-500 mb-1">Your notes</p>
                        <p className="text-sm text-slate-700">{ci.coach_notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {tab === "ai" && (
          <div className="max-w-2xl">
            <AdaptiveSuggestionsPanel
              clientId={id}
              existingDrafts={existingDrafts}
              pendingSuggestions={pendingSuggestions}
            />
          </div>
        )}

        {tab === "transformation" && (
          <TransformationStudio
            clientId={id}
            clientName={profile?.full_name ?? "Client"}
            coachSlug={coach?.slug ?? ""}
            appUrl={process.env.NEXT_PUBLIC_APP_URL ?? "https://dawfit.app"}
            existing={transformation ?? null}
          />
        )}
      </div>
    </div>
  );
}
