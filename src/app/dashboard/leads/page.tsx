import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import { UserPlus } from "lucide-react";
import { CopyLeadLink } from "./copy-lead-link";

interface Props {
  searchParams: Promise<{ view?: string }>;
}

const STATUS_COLUMNS = ["new", "contacted", "qualified"] as const;
const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-50 text-blue-700",
  contacted: "bg-amber-50 text-amber-700",
  qualified: "bg-indigo-50 text-indigo-700",
  converted: "bg-green-50 text-green-700",
  rejected: "bg-slate-100 text-slate-500",
};

export default async function LeadsPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { view = "pipeline" } = await searchParams;

  const [{ data: activeLeads }, { data: closedLeads }, { data: coach }] = await Promise.all([
    supabase
      .from("leads")
      .select("id, full_name, email, status, source, created_at")
      .eq("coach_id", user.id)
      .not("status", "in", '("converted","rejected")')
      .order("created_at", { ascending: false }),
    supabase
      .from("leads")
      .select("id, full_name, email, status, source, created_at, converted_client_id")
      .eq("coach_id", user.id)
      .in("status", ["converted", "rejected"])
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("coaches")
      .select("slug")
      .eq("id", user.id)
      .single(),
  ]);

  const grouped = STATUS_COLUMNS.reduce((acc, status) => {
    acc[status] = activeLeads?.filter((l) => l.status === status) ?? [];
    return acc;
  }, {} as Record<string, typeof activeLeads>);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://dawfit.app";
  const applyLink = coach?.slug ? `${appUrl}/apply/${coach.slug}` : null;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
          <p className="text-slate-500 text-sm">{activeLeads?.length ?? 0} active</p>
        </div>
        {applyLink && (
          <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 text-sm min-w-0">
            <span className="text-slate-500 flex-shrink-0">Apply link:</span>
            <a
              href={applyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 font-medium hover:underline truncate"
            >
              /apply/{coach?.slug}
            </a>
            <CopyLeadLink url={applyLink} />
          </div>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 border-b border-slate-200 pb-0">
        {[
          { key: "pipeline", label: "Pipeline" },
          { key: "history", label: `History (${closedLeads?.length ?? 0})` },
        ].map(t => (
          <Link
            key={t.key}
            href={`/dashboard/leads?view=${t.key}`}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              view === t.key
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {view === "pipeline" && (
        <>
          {(!activeLeads || activeLeads.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-16 w-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
                <UserPlus className="h-8 w-8 text-violet-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Share your application page to start receiving leads</h2>
              <p className="text-slate-400 text-sm mt-1 max-w-sm">
                Share your /apply link on social media or your website — applications land here automatically.
              </p>
              {applyLink && (
                <a
                  href={applyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  View Apply Page
                </a>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {STATUS_COLUMNS.map((status) => (
                <div key={status}>
                  <div className="flex items-center gap-2 mb-3">
                    <h2 className="font-semibold text-slate-700 text-sm">{STATUS_LABELS[status]}</h2>
                    <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
                      {grouped[status]?.length ?? 0}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {(grouped[status] ?? []).map((lead) => (
                      <Link key={lead.id} href={`/dashboard/leads/${lead.id}`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-medium text-slate-800 text-sm truncate">
                                  {lead.full_name ?? "Unknown"}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5 truncate">{lead.email}</p>
                                <p className="text-xs text-slate-300 mt-1">
                                  {formatRelativeTime(lead.created_at)}
                                </p>
                              </div>
                              {lead.source && (
                                <Badge variant="secondary" className="text-xs flex-shrink-0">
                                  {lead.source.replace(/_/g, " ")}
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {view === "history" && (
        <div className="space-y-2 max-w-2xl">
          {(!closedLeads || closedLeads.length === 0) ? (
            <p className="text-slate-400 text-sm text-center py-10">No converted or rejected leads yet</p>
          ) : (
            closedLeads.map((lead) => (
              <Link key={lead.id} href={`/dashboard/leads/${lead.id}`}>
                <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 text-sm truncate">
                        {lead.full_name ?? "Unknown"}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{lead.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[lead.status]}`}>
                        {lead.status}
                      </span>
                      <span className="text-xs text-slate-300">{formatRelativeTime(lead.created_at)}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

