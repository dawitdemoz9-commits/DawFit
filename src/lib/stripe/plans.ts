export type PlanTier = "starter" | "pro" | "elite";

export interface Plan {
  tier: PlanTier;
  name: string;
  price_monthly: number;         // display price in USD
  price_id: string;              // Stripe price ID from env
  client_limit: number | null;   // null = unlimited
  features: string[];
  highlight?: boolean;
}

export const PLANS: Plan[] = [
  {
    tier: "starter",
    name: "Starter",
    price_monthly: 29,
    price_id: process.env.STRIPE_PRICE_STARTER ?? "",
    client_limit: 5,
    features: [
      "Up to 5 active clients",
      "Exercise library (500+ exercises)",
      "Workout & program builder",
      "Client workout logging",
      "Weekly check-ins",
      "Progress charts",
      "Lead capture page",
    ],
  },
  {
    tier: "pro",
    name: "Pro",
    price_monthly: 79,
    price_id: process.env.STRIPE_PRICE_PRO ?? "",
    client_limit: 20,
    highlight: true,
    features: [
      "Up to 20 active clients",
      "Everything in Starter",
      "AI Program Builder",
      "AI Adaptive Suggestions",
      "Transformation Studio",
      "Lead funnel automation",
      "Priority support",
    ],
  },
  {
    tier: "elite",
    name: "Elite",
    price_monthly: 149,
    price_id: process.env.STRIPE_PRICE_ELITE ?? "",
    client_limit: null,
    features: [
      "Unlimited active clients",
      "Everything in Pro",
      "Client messaging",
      "Session booking",
      "Advanced analytics",
      "White-label client portal",
      "Dedicated onboarding",
    ],
  },
];

export function getPlanByTier(tier: PlanTier | null): Plan | undefined {
  return PLANS.find(p => p.tier === tier);
}

export function getPlanByPriceId(priceId: string): Plan | undefined {
  return PLANS.find(p => p.price_id === priceId);
}

/**
 * Returns the tier for a given Stripe Price ID.
 * Falls back to matching env vars at runtime.
 */
export function tierFromPriceId(priceId: string): PlanTier | null {
  const plan = getPlanByPriceId(priceId);
  return plan?.tier ?? null;
}
