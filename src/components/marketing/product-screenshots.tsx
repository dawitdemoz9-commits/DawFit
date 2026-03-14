import Link from "next/link";
import { Users, ClipboardList, BarChart3, Megaphone } from "lucide-react";

const SCREENSHOTS = [
  {
    href: "/features/client-management",
    icon: Users,
    title: "Coach Dashboard",
    desc: "All your clients, check-ins, and messages in one view.",
    accent: "from-indigo-500/20 to-purple-500/10",
    iconBg: "bg-indigo-500/20",
    iconColor: "text-indigo-400",
    dots: ["bg-slate-600", "bg-slate-600", "bg-slate-600", "bg-indigo-500"],
  },
  {
    href: "/features/program-builder",
    icon: ClipboardList,
    title: "Program Builder",
    desc: "Build multi-week programs with exercises and sets in minutes.",
    accent: "from-violet-500/20 to-indigo-500/10",
    iconBg: "bg-violet-500/20",
    iconColor: "text-violet-400",
    dots: ["bg-slate-600", "bg-slate-600", "bg-violet-500", "bg-slate-600"],
  },
  {
    href: "/features/progress-tracking",
    icon: BarChart3,
    title: "Client Progress",
    desc: "Track workout logs, check-ins, and trends over time.",
    accent: "from-emerald-500/20 to-teal-500/10",
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
    dots: ["bg-slate-600", "bg-emerald-500", "bg-slate-600", "bg-slate-600"],
  },
  {
    href: "/features/lead-capture",
    icon: Megaphone,
    title: "Lead Pipeline",
    desc: "Capture, qualify, and convert leads from your public page.",
    accent: "from-amber-500/20 to-orange-500/10",
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
    dots: ["bg-amber-500", "bg-slate-600", "bg-slate-600", "bg-slate-600"],
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
        {SCREENSHOTS.map(({ href, icon: Icon, title, desc, accent, iconBg, iconColor, dots }) => (
          <Link key={title} href={href} className="group block">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-slate-600 transition-colors hover:shadow-xl hover:shadow-black/30">
              {/* Browser chrome */}
              <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 border-b border-slate-700/60">
                {dots.map((dot, i) => (
                  <div key={i} className={`h-2 w-2 rounded-full ${dot}`} />
                ))}
                <div className="flex-1 mx-3">
                  <div className="h-4 bg-slate-700 rounded w-36 mx-auto" />
                </div>
              </div>

              {/* Screenshot */}
              <div className={`h-48 bg-gradient-to-br ${accent} relative overflow-hidden flex items-center justify-center`}>
                {/* Fake UI elements */}
                <div className="absolute top-4 left-4 right-4 space-y-2 opacity-40">
                  <div className="h-2 bg-slate-500 rounded w-3/4" />
                  <div className="h-2 bg-slate-600 rounded w-1/2" />
                  <div className="h-2 bg-slate-600 rounded w-2/3" />
                </div>
                <div className="absolute bottom-4 left-4 right-4 space-y-2 opacity-30">
                  <div className="h-8 bg-slate-700/60 rounded-lg" />
                  <div className="h-8 bg-slate-700/40 rounded-lg" />
                </div>

                {/* Center icon */}
                <div className="relative text-center">
                  <div className={`h-12 w-12 ${iconBg} rounded-xl flex items-center justify-center mx-auto mb-2 border border-white/10`}>
                    <Icon className={`h-6 w-6 ${iconColor}`} />
                  </div>
                </div>
              </div>

              {/* Card footer */}
              <div className="px-5 py-4">
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
