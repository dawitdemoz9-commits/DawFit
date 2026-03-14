import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { ComparisonTable } from "@/components/marketing/comparison-table";

export const metadata: Metadata = {
  title: "DawFit vs TrueCoach — Coaching Platform Comparison",
  description:
    "Compare DawFit and TrueCoach. DawFit adds lead capture, AI program generation, session booking, and a full client acquisition pipeline.",
};

const ROWS = [
  { feature: "Lead Capture & Application Page", dawfit: true, competitor: false },
  { feature: "Program Builder", dawfit: true, competitor: true },
  { feature: "Client Management", dawfit: true, competitor: true },
  { feature: "Progress Tracking", dawfit: true, competitor: true },
  { feature: "Session Booking", dawfit: true, competitor: false },
  { feature: "AI Program Generation", dawfit: true, competitor: false },
  { feature: "Transformation Pages (shareable)", dawfit: true, competitor: false },
  { feature: "Built-in Messaging", dawfit: true, competitor: true },
  { feature: "Lead-to-Client Pipeline", dawfit: true, competitor: false },
];

const DIFFERENTIATORS = [
  "TrueCoach focuses on program delivery — DawFit adds the full client acquisition funnel on top",
  "Capture leads from a public application page without any third-party tools",
  "Book and manage coaching sessions directly inside the platform",
  "Generate program drafts with AI and refine before assigning",
];

export default function VsTrueCoachPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <MarketingNav />

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-14 text-center">
        <p className="text-indigo-400 text-sm font-medium mb-3 uppercase tracking-wide">
          Comparison
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5">
          DawFit vs TrueCoach
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
          TrueCoach is great for delivering programs. DawFit does that and handles your entire
          client acquisition pipeline — so you grow, not just coach.
        </p>
      </section>

      {/* Table */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <ComparisonTable competitor="TrueCoach" rows={ROWS} />
      </section>

      {/* Key differentiators */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">
            Why coaches choose DawFit over TrueCoach
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
          Get the full coaching business platform
        </h2>
        <p className="text-slate-400 text-sm mb-8">
          Everything TrueCoach does, plus lead capture, booking, and AI.
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
