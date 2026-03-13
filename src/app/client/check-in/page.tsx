import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CheckInForm } from "@/components/client/check-in-form";

export default async function CheckInPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Start of current week (Monday)
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  const weekStartDate = monday.toISOString().split("T")[0];

  const [{ data: existing }, { data: history }] = await Promise.all([
    supabase
      .from("check_ins")
      .select("id, sleep_quality, stress_level, soreness_level, weight, weight_unit, notes, submitted_at")
      .eq("client_id", user.id)
      .eq("week_start_date", weekStartDate)
      .maybeSingle(),
    supabase
      .from("check_ins")
      .select("week_start_date, sleep_quality, stress_level, soreness_level, weight, weight_unit, coach_notes, reviewed_at")
      .eq("client_id", user.id)
      .order("week_start_date", { ascending: false })
      .limit(4),
  ]);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Weekly Check-In</h1>
        <p className="text-slate-500 text-sm mt-1">
          Week of {monday.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>
      <CheckInForm
        weekStartDate={weekStartDate}
        existing={existing ?? null}
        history={history ?? []}
      />
    </div>
  );
}
