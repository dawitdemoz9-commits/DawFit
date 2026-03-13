import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import { UserPlus } from "lucide-react";

const STATUS_COLUMNS = ["new", "contacted", "qualified"] as const;
const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
};

export default async function LeadsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: leads } = await supabase
    .from("leads")
    .select("id, full_name, email, status, source, created_at")
    .eq("coach_id", user.id)
    .not("status", "in", '("converted","rejected")')
    .order("created_at", { ascending: false });

  const { data: coach } = await supabase
    .from("coaches")
    .select("slug")
    .eq("id", user.id)
    .single();

  const grouped = STATUS_COLUMNS.reduce((acc, status) => {
    acc[status] = leads?.filter((l) => l.status === status) ?? [];
    return acc;
  }, {} as Record<string, typeof leads>);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
          <p className="text-slate-500 text-sm">{leads?.length ?? 0} active leads</p>
        </div>
        {coach?.slug && (
          <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 text-sm">
            <span className="text-slate-500">Apply link:</span>
            <a
              href={`/apply/${coach.slug}`}
              target="_blank"
              className="text-primary font-medium hover:underline"
            >
              /apply/{coach.slug}
            </a>
          </div>
        )}
      </div>

      {(!leads || leads.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <UserPlus className="h-12 w-12 text-slate-300 mb-4" />
          <h2 className="text-lg font-semibold text-slate-700">No leads yet</h2>
          <p className="text-slate-400 text-sm mt-1 max-w-sm">
            Share your application page link to start capturing leads from potential clients.
          </p>
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
                          <div>
                            <p className="font-medium text-slate-800 text-sm">
                              {lead.full_name ?? "Unknown"}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">{lead.email}</p>
                            <p className="text-xs text-slate-300 mt-1">
                              {formatRelativeTime(lead.created_at)}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs flex-shrink-0">
                            {lead.source?.replace("_", " ")}
                          </Badge>
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
    </div>
  );
}
