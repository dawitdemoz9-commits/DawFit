import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, BarChart3, ClipboardList, Megaphone, CheckCircle } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { ProductScreenshots } from "@/components/marketing/product-screenshots";
import { SocialProof } from "@/components/marketing/social-proof";
import { FinalCTA } from "@/components/marketing/final-cta";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <MarketingNav />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight">
          Grow your coaching business
          <br />
          <span className="text-indigo-400">without burning out</span>
        </h1>
        <p className="text-slate-400 text-xl mt-6 max-w-2xl mx-auto leading-relaxed">
          DawFit helps fitness coaches manage clients, deliver programs, track progress, and turn
          leads into long-term clients.
        </p>
        <div className="flex items-center justify-center gap-4 mt-10">
          <Button size="lg" asChild className="bg-indigo-500 hover:bg-indigo-600">
            <Link href="/auth/signup">
              Start Free <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
            asChild
          >
            <Link href="#how-it-works">See How It Works</Link>
          </Button>
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Users,
              title: "Client Management",
              desc: "Manage clients, check-ins, messaging, and progress in one place.",
              href: "/features/client-management",
            },
            {
              icon: ClipboardList,
              title: "Program Builder",
              desc: "Create structured workout programs and assign them to clients in minutes.",
              href: "/features/program-builder",
            },
            {
              icon: BarChart3,
              title: "Progress Tracking",
              desc: "Clients log workouts and check-ins while you track trends and improvements.",
              href: "/features/progress-tracking",
            },
            {
              icon: Megaphone,
              title: "Lead Capture",
              desc: "Turn interested visitors into paying clients with public application pages.",
              href: "/features/lead-capture",
            },
          ].map(({ icon: Icon, title, desc, href }) => (
            <Link key={title} href={href} className="group">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600 transition-colors h-full">
                <div className="h-10 w-10 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="text-white font-semibold mb-1 group-hover:text-indigo-300 transition-colors">
                  {title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-3xl mx-auto px-6 pb-20">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 sm:p-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 text-center">
            How DawFit Helps Coaches Grow
          </h2>
          <p className="text-slate-400 text-center text-sm mb-8">
            A complete system from first contact to long-term retention.
          </p>
          <div className="space-y-4">
            {[
              "Capture leads from your coaching page",
              "Convert leads into clients",
              "Deliver programs and track results",
              "Retain clients with progress tracking",
            ].map((step, i) => (
              <div key={step} className="flex items-center gap-4">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <span className="text-indigo-400 text-sm font-semibold">{i + 1}</span>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <CheckCircle className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                  <p className="text-slate-200 text-sm">{step}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button size="lg" asChild className="bg-indigo-500 hover:bg-indigo-600">
              <Link href="/auth/signup">
                Start Free <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Product Screenshots */}
      <ProductScreenshots />

      {/* Social Proof */}
      <SocialProof />

      {/* Final CTA */}
      <FinalCTA />

      {/* Compare section */}
      <section className="max-w-3xl mx-auto px-6 pb-28 text-center">
        <h2 className="text-xl font-bold text-white mb-2">How does DawFit compare?</h2>
        <p className="text-slate-400 text-sm mb-6">
          See how DawFit stacks up against other coaching platforms.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {[
            { href: "/compare/trainerize", label: "vs Trainerize" },
            { href: "/compare/truecoach", label: "vs TrueCoach" },
            { href: "/compare/everfit", label: "vs Everfit" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-4 py-2 bg-slate-800/60 border border-slate-700 rounded-full text-slate-300 text-sm hover:text-white hover:border-slate-500 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
