import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { FinalCTA } from "@/components/marketing/final-cta";
import { CheckIcon, ArrowRight, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "DawFit Pricing — Simple Plans for Fitness Coaches",
  description:
    "Transparent pricing for fitness coaches. Start free, upgrade when you grow. Starter, Pro, and Elite plans available.",
};

const PLANS = [
  {
    name: "Starter",
    tagline: "For new coaches getting started",
    price: 39,
    highlight: false,
    features: [
      "Up to 20 clients",
      "Program builder",
      "Client progress tracking",
      "Lead capture pages",
      "Weekly check-ins",
      "Email support",
    ],
    cta: "Start Free",
  },
  {
    name: "Pro",
    tagline: "For growing coaching businesses",
    price: 79,
    highlight: true,
    features: [
      "Up to 100 clients",
      "Everything in Starter",
      "AI program generation",
      "Built-in messaging",
      "Transformation pages",
      "Lead pipeline & conversion",
      "Session booking",
      "Priority support",
    ],
    cta: "Start Free",
  },
  {
    name: "Elite",
    tagline: "For established coaching businesses",
    price: 149,
    highlight: false,
    features: [
      "Unlimited clients",
      "Everything in Pro",
      "Advanced automation",
      "Custom branding",
      "White-label support (coming soon)",
      "Dedicated account manager",
      "Early access to new features",
    ],
    cta: "Start Free",
  },
];

const FAQS = [
  {
    q: "How does the free trial work?",
    a: "You can start using DawFit for free with no credit card required. Your trial includes full access to the Pro plan features so you can explore everything before committing.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. There are no long-term contracts or cancellation fees. You can cancel your subscription at any time from your billing settings and you won't be charged again.",
  },
  {
    q: "Do my clients need to pay?",
    a: "No. DawFit is priced per coach, not per client. Your clients get free access to their portal where they can log workouts, submit check-ins, and message you.",
  },
  {
    q: "Can I upgrade or downgrade later?",
    a: "Absolutely. You can switch plans at any time. Upgrades take effect immediately, and downgrades apply at the start of your next billing cycle.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. DawFit is built on Supabase with row-level security, meaning your data and your clients' data is fully isolated and protected.",
  },
  {
    q: "What counts as a client?",
    a: "A client is any active user linked to your coaching account. You can archive inactive clients at any time, and they won't count toward your limit.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <MarketingNav />

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-14 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
          Simple pricing for growing
          <br />
          <span className="text-indigo-400">coaching businesses</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
          No hidden fees. No per-client charges. Start free and upgrade when you&apos;re ready.
        </p>
      </section>

      {/* Pricing cards */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-7 flex flex-col ${
                plan.highlight
                  ? "bg-indigo-600/10 border-indigo-500/50 shadow-xl shadow-indigo-900/20"
                  : "bg-slate-800/50 border-slate-700/50"
              }`}
            >
              {/* Most popular badge */}
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1.5 bg-indigo-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                    <Zap className="h-3 w-3" />
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan name & tagline */}
              <div className="mb-5">
                <p
                  className={`text-sm font-semibold mb-1 ${
                    plan.highlight ? "text-indigo-400" : "text-slate-400"
                  }`}
                >
                  {plan.name}
                </p>
                <p className="text-slate-400 text-xs leading-snug">{plan.tagline}</p>
              </div>

              {/* Price */}
              <div className="mb-7">
                <div className="flex items-end gap-1">
                  <span className="text-white text-4xl font-bold">${plan.price}</span>
                  <span className="text-slate-400 text-sm mb-1.5">/mo</span>
                </div>
                <p className="text-slate-500 text-xs mt-1">Billed monthly. Cancel anytime.</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5">
                    <div
                      className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        plan.highlight
                          ? "bg-indigo-500/20"
                          : "bg-slate-700"
                      }`}
                    >
                      <CheckIcon
                        className={`h-3 w-3 ${
                          plan.highlight ? "text-indigo-400" : "text-slate-400"
                        }`}
                      />
                    </div>
                    <span className="text-slate-300 text-sm leading-snug">{feat}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                asChild
                className={
                  plan.highlight
                    ? "bg-indigo-500 hover:bg-indigo-600 text-white w-full"
                    : "bg-slate-700 hover:bg-slate-600 text-white w-full"
                }
              >
                <Link href="/auth/signup">
                  {plan.cta} <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          ))}
        </div>

        {/* All plans note */}
        <p className="text-center text-slate-500 text-xs mt-6">
          All plans include a free trial · No credit card required to start
        </p>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold text-white text-center mb-10">
          Frequently asked questions
        </h2>
        <div className="space-y-4">
          {FAQS.map(({ q, a }) => (
            <div
              key={q}
              className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-6 py-5"
            >
              <p className="text-white font-medium text-sm mb-2">{q}</p>
              <p className="text-slate-400 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      <FinalCTA />
    </div>
  );
}
