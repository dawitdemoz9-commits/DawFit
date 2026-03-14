import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils";
import {
  Users,
  UserPlus,
  DollarSign,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { CoachOnboarding, FirstClientBanner } from "@/components/onboarding/coach-onboarding";
import { DashboardTasks } from "@/components/coach/dashboard-tasks";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const { demo } = await searchParams;
  const isDemo = demo === "true";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Parallel data fetch
  const [
    { count: clientCount },
    { count: activeClientCount },
    { count: newLeadCount },
    { count: pendingDraftCount },
    { count: programCount },
    { count: exerciseCount },
    { data: recentClients },
    { data: recentLeads },
    { data: pendingDrafts },
    { data: coach },
  ] = await Promise.all([
    supabase.from("clients").select("*", { count: "exact", head: true }).eq("coach_id", user.id),
    supabase.from("clients").select("*", { count: "exact", head: true }).eq("coach_id", user.id).eq("status", "active"),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("coach_id", user.id).eq("status", "new"),
    supabase.from("ai_drafts").select("*", { count: "exact", head: true }).eq("coach_id", user.id).eq("status", "pending"),
    supabase.from("programs").select("*", { count: "exact", head: true }).eq("coach_id", user.id),
    supabase.from("exercises").select("*", { count: "exact", head: true }).or(`coach_id.eq.${user.id},coach_id.is.null`),
    supabase
      .from("clients")
      .select("id, status, profiles(full_name, avatar_url)")
      .eq("coach_id", user.id)
      .order("onboarded_at", { ascending: false })
      .limit(5),
    supabase
      .from("leads")
      .select("id, full_name, email, status, created_at")
      .eq("coach_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("ai_drafts")
      .select("id, type, status, created_at")
      .eq("coach_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase.from("coaches").select("slug").eq("id", user.id).single(),
  ]);

  const recentWorkoutLogs: never[] = [];
  const unreviewedCheckIns: never[] = [];
  const unreadMessageCount = 0;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://dawfit.app";
  const hasProgram = (programCount ?? 0) > 0;
  const hasClient = (clientCount ?? 0) > 0;
  const hasProgramAssigned = hasClient && hasProgram;
  const firstClient = recentClients?.[recentClients.length - 1] ?? recentClients?.[0] ?? null;
  const showFirstClientBanner = clientCount === 1 && firstClient;

  // Build task props
  type ProfileJoin = { full_name: string | null } | { full_name: string | null }[] | null;
  function getName(clients: unknown): string {
    const c = clients as { profiles: ProfileJoin } | null;
    if (!c) return "Client";
    const p = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
    return p?.full_name ?? "Client";
  }

  const workoutLogTasks = (recentWorkoutLogs ?? []).map(log => ({
    logId: log.id,
    clientId: log.client_id,
    clientName: getName(log.clients),
    loggedAt: log.logged_at,
  }));

  const checkInTasks = (unreviewedCheckIns ?? []).map(ci => ({
    checkInId: ci.id,
    clientId: ci.client_id,
    clientName: getName(ci.clients),
    submittedAt: ci.submitted_at,
  }));

  const newLeadTasks = (recentLeads ?? [])
    .filter(l => l.status === "new")
    .map(l => ({ id: l.id, full_name: l.full_name, email: l.email }));

  const stats = [
    {
      title: "Total Clients",
      value: clientCount ?? 0,
      sub: `${activeClientCount ?? 0} active`,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      href: "/dashboard/clients",
    },
    {
      title: "New Leads",
      value: newLeadCount ?? 0,
      sub: "Awaiting review",
      icon: UserPlus,
      color: "text-violet-600",
      bg: "bg-violet-50",
      href: "/dashboard/leads",
    },
    {
      title: "Programs",
      value: programCount ?? 0,
      sub: "In your library",
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      href: "/dashboard/programs",
    },
    {
      title: "Revenue",
      value: "$0", // TODO Phase 5: replace with Stripe MRR query
      sub: "Connect Stripe to track",
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-50",
      href: "/dashboard/settings",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Here&apos;s what&apos;s happening across your business</p>
      </div>

      {/* First client success banner */}
      {!isDemo && showFirstClientBanner && (
        <FirstClientBanner clientId={firstClient!.id} />
      )}

      {/* Onboarding progress */}
      {!isDemo && (
        <CoachOnboarding
          hasProgram={hasProgram}
          hasClient={hasClient}
          hasProgramAssigned={hasProgramAssigned}
          coachSlug={coach?.slug ?? null}
          appUrl={appUrl}
        />
      )}

      {/* Today's Tasks */}
      <DashboardTasks
        recentWorkoutLogs={workoutLogTasks}
        unreviewedCheckIns={checkInTasks}
        unreadMessageCount={unreadMessageCount ?? 0}
        pendingDraftCount={pendingDraftCount ?? 0}
        newLeads={newLeadTasks}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ title, value, sub, icon: Icon, color, bg, href }: { title: string; value: string | number; sub: string; icon: React.ElementType; color: string; bg: string; href: string }) => (
          <Link key={title} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500 font-medium">{title}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                  </div>
                  <div className={`p-2.5 rounded-lg ${bg}`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Clients */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Recent Clients</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/clients" className="text-xs">
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {(!recentClients || recentClients.length === 0) ? (
              <div className="text-center py-6">
                <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No clients yet</p>
                <Button size="sm" variant="outline" className="mt-3" asChild>
                  <Link href="/dashboard/clients">Add your first client</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentClients.map((client) => {
                  const profile = Array.isArray(client.profiles) ? client.profiles[0] : client.profiles;
                  return (
                    <Link
                      key={client.id}
                      href={`/dashboard/clients/${client.id}`}
                      className="flex items-center justify-between hover:bg-slate-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                          {(profile?.full_name ?? "?").charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          {profile?.full_name ?? "Unnamed"}
                        </span>
                      </div>
                      <Badge
                        variant={client.status === "active" ? "success" : "secondary"}
                        className="text-xs"
                      >
                        {client.status}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* New Leads */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">New Leads</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/leads" className="text-xs">
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {(!recentLeads || recentLeads.length === 0) ? (
              <div className="text-center py-6">
                <UserPlus className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No leads yet</p>
                <Button size="sm" variant="outline" className="mt-3" asChild>
                  <Link href="/dashboard/settings">Share your apply link</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentLeads.map((lead) => (
                  <Link
                    key={lead.id}
                    href={`/dashboard/leads/${lead.id}`}
                    className="flex items-center justify-between hover:bg-slate-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-700">{lead.full_name ?? lead.email}</p>
                      <p className="text-xs text-slate-400">{formatRelativeTime(lead.created_at)}</p>
                    </div>
                    <Badge
                      variant={lead.status === "new" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {lead.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Drafts Pending */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Pending AI Drafts</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/ai" className="text-xs">
                Review all <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {(!pendingDrafts || pendingDrafts.length === 0) ? (
              <div className="text-center py-6">
                <CheckCircle2 className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">All caught up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingDrafts.map((draft) => (
                  <Link
                    key={draft.id}
                    href={`/dashboard/ai/drafts/${draft.id}`}
                    className="flex items-center justify-between hover:bg-slate-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-700 capitalize">
                        {draft.type.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-slate-400">{formatRelativeTime(draft.created_at)}</p>
                    </div>
                    <Badge variant="warning" className="text-xs">Review</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
