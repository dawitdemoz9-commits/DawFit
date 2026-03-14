import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { ComparisonTable } from "@/components/marketing/comparison-table";

export const metadata: Metadata = {
  title: "DawFit vs Everfit — Coaching Platform Comparison",
  description:
    "Compare DawFit and Everfit. See which coaching platform offers better lead capture, AI generation, and client acquisition tools.",
};

const ROWS = [
  { feature: "Lead Capture & Application Page", dawfit: true, competitor: "partial" as const },
  { feature: "Program Builder", dawfit: true, competitor: true },
  { feature: "Client Management", dawfit: true, competitor: true },
  { feature: "Progress Tracking", dawfit: true, competitor: true },
  { feature: "Session Booking", dawfit: true, competitor: true },
  { feature: "AI Program Generation", dawfit: true, competitor: "partial" as const },
  { feature: "Transformation Pages (shareable)", dawfit: true, competitor: false },
  { feature: "Built-in Messaging", dawfit: true, competitor: true },
  { feature: "Lead-to-Client Pipeline", dawfit: true, competitor: "partial" as const },
];

const DIFFERENTIATORS = [
  "DawFit's lead pipeline is purpose-built — kanban view, application history, one-click conversion",
  "Shareable transformation pages let clients market your coaching for you",
  "AI program generation trained on coaching outcomes, not generic templates",
  "Simpler, faster onboarding — coaches are set up in under 10 minutes",
];

export default function VsEverfitPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <MarketingNav />

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-14 text-center">
        <p className="text-indigo-400 text-sm font-medium mb-3 uppercase tracking-wide">
          Comparison
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5">
          DawFit vs Everfit
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
          Everfit covers the core coaching features well. DawFit takes it further with a full lead
          pipeline, shareable transformation pages, and AI-powered program generation.
        </p>
      </section>

      {/* Table */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <ComparisonTable competitor="Everfit" rows={ROWS} />
      </section>

      {/* Key differentiators */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">
            Where DawFit pulls ahead of Everfit
          </h2>
          <div className="space-y-4">
            {DIFFERENTIATORS.map((point) => (
              <div key={point} className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <p className="text-slate-300 text-sm leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-xl mx-auto px-6 pb-28 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">
          See the difference for yourself
        </h2>
        <p className="text-slate-400 text-sm mb-8">
          Free to start. No credit card needed. Set up in minutes.
        </p>
        <Button size="lg" asChild className="bg-indigo-500 hover:bg-indigo-600">
          <Link href="/auth/signup">
            Start Free <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
