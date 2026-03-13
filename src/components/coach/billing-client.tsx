"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckIcon, AlertCircleIcon, ExternalLinkIcon } from "lucide-react";
import type { Plan, PlanTier } from "@/lib/stripe/plans";

interface BillingClientProps {
  plans: Plan[];
  currentTier: PlanTier | null;
  subscriptionStatus: string | null;
  hasCustomer: boolean;
  periodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  successTier: string | null;
  canceled: boolean;
}

export function BillingClient({
  plans,
  currentTier,
  subscriptionStatus,
  hasCustomer,
  periodEnd,
  cancelAtPeriodEnd,
  successTier,
  canceled,
}: BillingClientProps) {
  const router = useRouter();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const isActive = subscriptionStatus === "active" || subscriptionStatus === "trialing";
  const isPastDue = subscriptionStatus === "past_due";

  async function handleSubscribe(tier: PlanTier) {
    setLoadingTier(tier);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      }
    } catch {
      // silent — Stripe redirect either happens or doesn't
    } finally {
      setLoadingTier(null);
    }
  }

  async function handleManageBilling() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/create-portal", { method: "POST" });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      }
    } finally {
      setPortalLoading(false);
    }
  }

  function periodEndLabel() {
    if (!periodEnd) return null;
    const d = new Date(periodEnd);
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Billing & Plans</h1>
          <p className="text-slate-500 text-sm">Manage your DawFit subscription</p>
        </div>
        {hasCustomer && (
          <Button variant="outline" size="sm" onClick={handleManageBilling} disabled={portalLoading}>
            <ExternalLinkIcon className="w-4 h-4 mr-2" />
            {portalLoading ? "Redirecting..." : "Manage Billing"}
          </Button>
        )}
      </div>

      {/* Toast-style banners */}
      {successTier && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-2 text-green-800 text-sm">
          <CheckIcon className="w-4 h-4 flex-shrink-0" />
          <span>
            You&apos;re now on the <strong className="capitalize">{successTier}</strong> plan. Thanks for subscribing!
          </span>
        </div>
      )}
      {canceled && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-600">
          Checkout was canceled — no charges were made.
        </div>
      )}
      {isPastDue && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-2 text-red-700 text-sm">
          <AlertCircleIcon className="w-4 h-4 flex-shrink-0" />
          <span>Your last payment failed. Please update your payment method to keep your subscription active.</span>
          {hasCustomer && (
            <Button variant="outline" size="sm" className="ml-auto border-red-300 text-red-700 hover:bg-red-100" onClick={handleManageBilling} disabled={portalLoading}>
              {portalLoading ? "..." : "Fix payment"}
            </Button>
          )}
        </div>
      )}

      {/* Current plan status strip */}
      {currentTier && isActive && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 flex items-center gap-3 text-sm">
          <Badge className="capitalize bg-indigo-600 text-white">{currentTier}</Badge>
          <span className="text-indigo-800">
            {cancelAtPeriodEnd
              ? `Cancels on ${periodEndLabel()} — no further charges`
              : `Renews on ${periodEndLabel()}`}
          </span>
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isCurrent = plan.tier === currentTier && isActive;
          const isHighlight = plan.highlight;

          return (
            <Card
              key={plan.tier}
              className={[
                "relative flex flex-col",
                isHighlight ? "border-indigo-400 shadow-md ring-1 ring-indigo-400" : "border-slate-200",
                isCurrent ? "bg-indigo-50/40" : "bg-white",
              ].join(" ")}
            >
              {isHighlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-indigo-600 text-white text-xs font-semibold px-3 py-0.5 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">{plan.name}</CardTitle>
                  {isCurrent && (
                    <Badge variant="secondary" className="text-xs bg-indigo-100 text-indigo-700">
                      Current
                    </Badge>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-bold text-slate-900">${plan.price_monthly}</span>
                  <span className="text-slate-500 text-sm">/mo</span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 gap-4">
                <ul className="space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckIcon className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <Button variant="outline" disabled className="w-full text-indigo-700 border-indigo-300">
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    className={["w-full", isHighlight ? "bg-indigo-600 hover:bg-indigo-700 text-white" : ""].join(" ")}
                    variant={isHighlight ? "default" : "outline"}
                    disabled={loadingTier === plan.tier}
                    onClick={() => handleSubscribe(plan.tier)}
                  >
                    {loadingTier === plan.tier
                      ? "Redirecting..."
                      : currentTier
                        ? plan.price_monthly > (plans.find(p => p.tier === currentTier)?.price_monthly ?? 0)
                          ? `Upgrade to ${plan.name}`
                          : `Switch to ${plan.name}`
                        : `Get ${plan.name}`}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-slate-400 text-center">
        All plans billed monthly. Cancel anytime from Manage Billing. Upgrades take effect immediately.
      </p>
    </div>
  );
}
