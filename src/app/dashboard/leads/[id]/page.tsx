import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, UserPlus, Mail, Phone, Calendar, Globe } from "lucide-react";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { LeadActions } from "@/components/coach/lead-actions";

interface Props {
  params: Promise<{ id: string }>;
}

const STATUS_ORDER = ["new", "contacted", "qualified", "converted", "rejected"] as const;
type LeadStatus = typeof STATUS_ORDER[number];

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-amber-100 text-amber-700",
  qualified: "bg-indigo-100 text-indigo-700",
  converted: "bg-green-100 text-green-700",
  rejected: "bg-slate-100 text-slate-500",
};

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: lead } = await supabase
    .from("leads")
    .select("id, full_name, email, phone, status, source, converted_client_id, created_at, updated_at")
    .eq("id", id)
    .eq("coach_id", user.id)
    .single();

  if (!lead) notFound();

  // Load all applications (full history)
  const { data: applications } = await supabase
    .from("lead_applications")
    .select("id, goals, experience_level, availability, budget_range, health_notes, submitted_at")
    .eq("lead_id", id)
    .order("submitted_at", { ascending: false });

  const latestApp = applications?.[0] ?? null;
  const status = lead.status as LeadStatus;

  const nextStatuses: Partial<Record<LeadStatus, LeadStatus>> = {
    new: "contacted",
    contacted: "qualified",
  };
  const nextStatus = nextStatuses[status];

  return (
    <div className="p-6 space-y-5 max-w-2xl">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/leads" className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900">{lead.full_name ?? lead.email}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[status]}`}>
              {status}
            </span>
            {lead.source && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {lead.source.replace(/_/g, " ")}
              </span>
            )}
            <span className="text-xs text-slate-400">{formatRelativeTime(lead.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Contact info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-slate-700">
            <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <a href={`mailto:${lead.email}`} className="hover:text-indigo-600 transition-colors">
              {lead.email}
            </a>
          </div>
          {lead.phone && (
            <div className="flex items-center gap-2 text-slate-700">
              <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <a href={`tel:${lead.phone}`} className="hover:text-indigo-600 transition-colors">
                {lead.phone}
              </a>
            </div>
          )}
          <div className="flex items-center gap-2 text-slate-500">
            <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
            Applied {formatDate(lead.created_at)}
          </div>
        </CardContent>
      </Card>

      {/* Latest application */}
      {latestApp && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Application</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {latestApp.goals && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Goals</p>
                <p className="text-slate-800 leading-relaxed">{latestApp.goals}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {latestApp.experience_level && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Experience</p>
                  <p className="text-slate-700">{latestApp.experience_level}</p>
                </div>
              )}
              {latestApp.availability && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Availability</p>
                  <p className="text-slate-700">{latestApp.availability}</p>
                </div>
              )}
              {latestApp.budget_range && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Budget</p>
                  <p className="text-slate-700">{latestApp.budget_range}</p>
                </div>
              )}
            </div>
            {latestApp.health_notes && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Health notes</p>
                <p className="text-slate-700 leading-relaxed">{latestApp.health_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Application history (if more than one) */}
      {(applications?.length ?? 0) > 1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Application History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {applications!.map((app, i) => (
              <div key={app.id} className="flex items-center justify-between text-sm border-b last:border-0 pb-2 last:pb-0">
                <span className="text-slate-500">
                  Submission {applications!.length - i}
                </span>
                <span className="text-xs text-slate-400">{formatDate(app.submitted_at)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <LeadActions
        leadId={id}
        status={status}
        nextStatus={nextStatus}
        convertedClientId={lead.converted_client_id}
      />
    </div>
  );
}
