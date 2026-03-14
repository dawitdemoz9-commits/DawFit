import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarDays } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="max-w-3xl mx-auto px-6 pb-28">
      <div className="relative rounded-2xl overflow-hidden border border-indigo-500/20">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-slate-800/60 to-slate-900" />
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

        {/* Content */}
        <div className="relative px-8 py-14 sm:px-14 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
            Start growing your coaching
            <br />
            business today
          </h2>
          <p className="text-slate-400 text-base max-w-lg mx-auto leading-relaxed mb-10">
            Manage clients, deliver programs, and turn leads into long-term clients with DawFit.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" asChild className="bg-indigo-500 hover:bg-indigo-600 w-full sm:w-auto">
              <Link href="/auth/signup">
                Start Free <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700 w-full sm:w-auto"
            >
              <Link href="/auth/signup">
                <CalendarDays className="h-4 w-4 mr-1.5" />
                Book a Demo
              </Link>
            </Button>
          </div>

          <p className="text-slate-600 text-xs mt-6">
            Free to start · No credit card required · Set up in minutes
          </p>
        </div>
      </div>
    </section>
  );
}
