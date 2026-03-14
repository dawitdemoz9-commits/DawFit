import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus, Users } from "lucide-react";
import { InviteClientDialog } from "@/components/coach/invite-client-dialog";

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: clients } = await supabase
    .from("clients")
    .select("id, status, goals, onboarded_at, profiles(full_name, avatar_url)")
    .eq("coach_id", user.id)
    .order("onboarded_at", { ascending: false });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
          <p className="text-slate-500 text-sm">{clients?.length ?? 0} total clients</p>
        </div>
        <InviteClientDialog />
      </div>

      {(!clients || clients.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">Add your first client to start coaching</h2>
          <p className="text-slate-400 text-sm mt-1 max-w-sm">
            Invite a client by email &mdash; they&apos;ll create their account and appear in your dashboard instantly.
          </p>
          <InviteClientDialog trigger={<Button className="mt-5"><UserPlus className="h-4 w-4 mr-2" />Invite First Client</Button>} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map((client) => {
            const profile = Array.isArray(client.profiles) ? client.profiles[0] : client.profiles;
            return (
              <Link key={client.id} href={`/dashboard/clients/${client.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600 flex-shrink-0">
                        {(profile?.full_name ?? "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-slate-900 truncate">
                            {profile?.full_name ?? "Unnamed Client"}
                          </p>
                          <Badge
                            variant={
                              client.status === "active"
                                ? "success"
                                : client.status === "paused"
                                ? "warning"
                                : "secondary"
                            }
                            className="text-xs flex-shrink-0"
                          >
                            {client.status}
                          </Badge>
                        </div>
                        {client.goals && (
                          <p className="text-xs text-slate-400 mt-1 truncate">{client.goals}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
