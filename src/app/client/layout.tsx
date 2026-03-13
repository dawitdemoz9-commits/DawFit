import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClientSidebar } from "@/components/client/sidebar";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "client") redirect("/dashboard");

  const { data: client } = await supabase
    .from("clients")
    .select("coach_id")
    .eq("id", user.id)
    .single();

  if (!client) redirect("/auth/login");

  const { data: coach } = await supabase
    .from("coaches")
    .select("business_name, brand_color, profiles(full_name)")
    .eq("id", client.coach_id)
    .single();

  const coachProfile = Array.isArray(coach?.profiles) ? coach.profiles[0] : coach?.profiles;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <ClientSidebar
        clientName={profile?.full_name ?? user.email ?? "Client"}
        clientAvatar={profile?.avatar_url ?? undefined}
        coachName={coachProfile?.full_name ?? "Coach"}
        coachBusinessName={coach?.business_name ?? "DawFit"}
        brandColor={coach?.brand_color ?? "#3B82F6"}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
