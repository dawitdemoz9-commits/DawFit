import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, ChevronRight } from "lucide-react";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: coach } = await supabase
    .from("coaches")
    .select("slug, business_name, brand_color, bio, website_url")
    .eq("id", user.id)
    .single();

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm">Manage your coaching profile and preferences</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Application Page</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-2">Share this link to capture leads:</p>
          <div className="flex items-center gap-2 bg-slate-50 border rounded-lg px-3 py-2">
            <span className="text-sm font-mono text-primary">
              {process.env.NEXT_PUBLIC_APP_URL ?? "https://dawfit.app"}/apply/{coach?.slug}
            </span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Profile & Branding</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p><span className="font-medium">Business:</span> {coach?.business_name}</p>
          <p><span className="font-medium">Slug:</span> {coach?.slug}</p>
          <p><span className="font-medium">Brand color:</span> {coach?.brand_color}</p>
          <p className="text-xs text-slate-400 mt-3">Full settings editor coming in Phase 10</p>
        </CardContent>
      </Card>

      {/* Billing */}
      <Link href="/dashboard/settings/billing">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-indigo-50">
                <CreditCard className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 text-sm">Billing & Plans</p>
                <p className="text-xs text-slate-400 mt-0.5">Manage your subscription, upgrade or downgrade your plan</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
