import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "@/components/coach/onboarding-form";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: coach } = await supabase
    .from("coaches")
    .select("*, profiles(*)")
    .eq("id", user.id)
    .single();

  // Already onboarded
  if (coach?.onboarded_at) redirect("/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-bold text-xl">D</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Set up your coaching profile</h1>
          <p className="text-slate-500 mt-1">This is how clients will find and see you</p>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-8">
          <OnboardingForm defaultName={profile?.full_name ?? ""} />
        </div>
      </div>
    </div>
  );
}
