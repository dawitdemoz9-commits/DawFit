import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PLANS } from "@/lib/stripe/plans";
import { BillingClient } from "@/components/coach/billing-client";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string; tier?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const params = await searchParams;

  const { data: coach } = await supabase
    .from("coaches")
    .select("subscription_tier, subscription_status, stripe_customer_id")
    .eq("id", user.id)
    .single();

  const { data: subscription } = await supabase
    .from("stripe_subscriptions")
    .select("stripe_subscription_id, status, current_period_end, cancel_at_period_end, stripe_price_id")
    .eq("coach_id", user.id)
    .in("status", ["active", "trialing", "past_due"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <BillingClient
      plans={PLANS}
      currentTier={coach?.subscription_tier ?? null}
      subscriptionStatus={coach?.subscription_status ?? null}
      hasCustomer={!!coach?.stripe_customer_id}
      periodEnd={subscription?.current_period_end ?? null}
      cancelAtPeriodEnd={subscription?.cancel_at_period_end ?? false}
      successTier={params.success === "true" ? (params.tier ?? null) : null}
      canceled={params.canceled === "true"}
    />
  );
}
