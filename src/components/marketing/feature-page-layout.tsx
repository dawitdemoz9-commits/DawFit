import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { MarketingNav } from "./marketing-nav";
import { type LucideIcon } from "lucide-react";
import type { ComponentType, ReactNode } from "react";

interface Benefit {
  icon: LucideIcon;
  title: string;
  desc: string;
}

interface Step {
  title: string;
  desc: string;
}

interface FeaturePageLayoutProps {
  icon: LucideIcon;
  eyebrow: string;
  headline: ReactNode;
  subheadline: string;
  Mockup: ComponentType;
  benefits: Benefit[];
  steps: Step[];
  ctaHeadline: string;
}

export function FeaturePageLayout({
  icon: Icon,
  eyebrow,
  headline,
  subheadline,
  Mockup,
  benefits,
  steps,
  ctaHeadline,
}: FeaturePageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <MarketingNav />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-6">
          <Icon className="h-4 w-4 text-indigo-400" />
          <span className="text-indigo-300 text-sm font-medium">{eyebrow}</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5">
          {headline}
        </h1>
        <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed mb-10">
          {subheadline}
        </p>
        <Button size="lg" asChild className="bg-indigo-500 hover:bg-indigo-600">
          <Link href="/auth/signup">
            Start Free <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </section>

      {/* Product Mockup */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="rounded-2xl border border-slate-700/60 overflow-hidden shadow-2xl shadow-black/40">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border-b border-slate-700/60">
            <div className="h-3 w-3 rounded-full bg-red-500/60" />
            <div className="h-3 w-3 rounded-full bg-amber-500/60" />
            <div className="h-3 w-3 rounded-full bg-green-500/60" />
            <div className="flex-1 mx-4">
              <div className="h-5 bg-slate-700 rounded-md w-48 mx-auto flex items-center justify-center">
                <span className="text-slate-400 text-xs">app.dawfit.com</span>
              </div>
            </div>
          </div>
          {/* Mockup area */}
          <div className="h-80 sm:h-96">
            <Mockup />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3">
          Everything you need, nothing you don&apos;t
        </h2>
        <p className="text-slate-400 text-center text-sm mb-10">
          Built for coaches who want results, not complexity.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {benefits.map(({ icon: BIcon, title, desc }) => (
            <div
              key={title}
              className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6"
            >
              <div className="h-10 w-10 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4">
                <BIcon className="h-5 w-5 text-indigo-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            How it works
          </h2>
          <div className="space-y-5">
            {steps.map((step, i) => (
              <div key={step.title} className="flex items-start gap-4">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mt-0.5">
                  <span className="text-indigo-400 text-sm font-semibold">{i + 1}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <CheckCircle className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                    <p className="text-white font-medium text-sm">{step.title}</p>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed pl-6">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 pb-28 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">{ctaHeadline}</h2>
        <p className="text-slate-400 mb-8">
          Join coaches already using DawFit to grow their business.
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
