import Link from "next/link";
import { DashboardMockup, ProgramBuilderMockup, LeadPipelineMockup, ProgressMockup } from "./mockups";

const SCREENSHOTS = [
  {
    href: "/features/client-management",
    title: "Coach Dashboard",
    desc: "All your clients, check-ins, and messages in one view.",
    Mockup: DashboardMockup,
  },
  {
    href: "/features/program-builder",
    title: "Program Builder",
    desc: "Build multi-week programs with exercises and sets in minutes.",
    Mockup: ProgramBuilderMockup,
  },
  {
    href: "/features/lead-capture",
    title: "Lead Pipeline",
    desc: "Capture, qualify, and convert leads from your public page.",
    Mockup: LeadPipelineMockup,
  },
  {
    href: "/features/progress-tracking",
    title: "Client Progress",
    desc: "Track workout logs, check-ins, and trends over time.",
    Mockup: ProgressMockup,
  },
];

export function ProductScreenshots() {
  return (
    <section className="max-w-5xl mx-auto px-6 pb-24">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          See DawFit in action
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Purpose-built tools that fit how real coaching businesses work.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {SCREENSHOTS.map(({ href, title, desc, Mockup }) => (
          <Link key={title} href={href} className="group block">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-slate-600 transition-colors hover:shadow-xl hover:shadow-black/30">
              {/* Browser chrome */}
              <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 border-b border-slate-700/60">
                <div className="h-2 w-2 rounded-full bg-red-500/60" />
                <div className="h-2 w-2 rounded-full bg-yellow-500/60" />
                <div className="h-2 w-2 rounded-full bg-green-500/60" />
                <div className="flex-1 mx-3">
                  <div className="h-4 bg-slate-700 rounded w-36 mx-auto flex items-center justify-center">
                    <span className="text-slate-400 text-[9px]">app.dawfit.com</span>
                  </div>
                </div>
              </div>

              {/* UI Mockup */}
              <div className="h-52">
                <Mockup />
              </div>

              {/* Card footer */}
              <div className="px-5 py-4 border-t border-slate-700/40">
                <p className="text-white font-semibold text-sm group-hover:text-indigo-300 transition-colors">
                  {title}
                </p>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">{desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
