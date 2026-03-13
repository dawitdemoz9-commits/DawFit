import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Users, BarChart3, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <span className="text-white font-bold text-xl">DawFit</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild className="text-slate-300 hover:text-white hover:bg-slate-700">
            <Link href="/auth/login">Sign in</Link>
          </Button>
          <Button asChild className="bg-blue-500 hover:bg-blue-600">
            <Link href="/auth/signup">Get Started Free</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          Powered by Claude AI
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight">
          Scale your coaching
          <br />
          <span className="text-blue-400">without burning out</span>
        </h1>
        <p className="text-slate-400 text-xl mt-6 max-w-2xl mx-auto leading-relaxed">
          DawFit gives fitness coaches the AI-powered tools to manage more clients, deliver adaptive programs, and grow a sustainable business.
        </p>
        <div className="flex items-center justify-center gap-4 mt-10">
          <Button size="lg" asChild className="bg-blue-500 hover:bg-blue-600">
            <Link href="/auth/signup">
              Start for free <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700" asChild>
            <Link href="/auth/login">Sign in</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Zap,
              title: "Adaptive Programs",
              desc: "AI analyzes logs and RPE to suggest real-time adjustments",
            },
            {
              icon: Users,
              title: "Client Management",
              desc: "Full client profiles, check-ins, messaging, and booking",
            },
            {
              icon: Sparkles,
              title: "AI Program Builder",
              desc: "Generate complete programs — you review before they go live",
            },
            {
              icon: BarChart3,
              title: "Lead Capture",
              desc: "Public apply page converts interested clients automatically",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <div className="h-10 w-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold mb-1">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
