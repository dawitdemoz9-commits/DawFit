import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { ComparisonTable } from "@/components/marketing/comparison-table";

export const metadata: Metadata = {
  title: "DawFit vs Trainerize — Coaching Platform Comparison",
  description:
    "See how DawFit compares to Trainerize for fitness coaches. Lead capture, AI program generation, client management, and more.",
};

const ROWS = [
  { feature: "Lead Capture & Application Page", dawfit: true, competitor: false },
  { feature: "Program Builder", dawfit: true, competitor: true },
  { feature: "Client Management", dawfit: true, competitor: true },
  { feature: "Progress Tracking", dawfit: true, competitor: true },
  { feature: "Session Booking", dawfit: true, competitor: "partial" as const },
  { feature: "AI Program Generation", dawfit: true, competitor: false },
  { feature: "Transformation Pages (shareable)", dawfit: true, competitor: false },
  { feature: "Built-in Messaging", dawfit: true, competitor: true },
  { feature: "Lead-to-Client Pipeline", dawfit: true, competitor: false },
];

const DIFFERENTIATORS = [
  "Lead capture built into the platform — no need for separate landing page tools",
  "AI-generated program drafts based on client goals",
  "Shareable transformation pages for social proof",
  "One-click lead-to-client conversion with automatic invite email",
];

export default function VsTrainerizePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <MarketingNav />

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-14 text-center">
        <p className="text-indigo-400 text-sm font-medium mb-3 uppercase tracking-wide">
          Comparison
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5">
          DawFit vs Trainerize
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
          Trainerize is a solid training app. But if you need lead capture, AI generation, and a full
          client acquisition system — DawFit is built for that.
        </p>
      </section>

      {/* Table */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <ComparisonTable competitor="Trainerize" rows={ROWS} />
      </section>

      {/* Key differentiators */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">
            Why coaches switch from Trainerize to DawFit
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
          Ready to grow beyond a training app?
        </h2>
        <p className="text-slate-400 text-sm mb-8">
          DawFit gives you the full system — from first lead to long-term client.
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
