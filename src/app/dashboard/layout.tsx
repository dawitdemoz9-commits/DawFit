import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CoachSidebar } from "@/components/coach/sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const [{ data: profile }, { data: coach }] = await Promise.all([
    supabase.from("profiles").select("role, full_name, avatar_url").eq("id", user.id).single(),
    supabase.from("coaches").select("business_name, brand_color, onboarded_at").eq("id", user.id).single(),
  ]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <CoachSidebar
        coachName={profile?.full_name ?? user.email ?? "Coach"}
        coachAvatar={profile?.avatar_url ?? undefined}
        businessName={coach?.business_name ?? "DawFit"}
        brandColor={coach?.brand_color ?? "#3B82F6"}
      />
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
