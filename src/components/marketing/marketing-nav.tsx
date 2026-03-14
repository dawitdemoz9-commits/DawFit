import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronDown, Users, ClipboardList, BarChart3, Megaphone } from "lucide-react";

const FEATURES = [
  {
    href: "/features/client-management",
    label: "Client Management",
    icon: Users,
    desc: "Manage clients at scale",
  },
  {
    href: "/features/program-builder",
    label: "Program Builder",
    icon: ClipboardList,
    desc: "Build and assign programs fast",
  },
  {
    href: "/features/progress-tracking",
    label: "Progress Tracking",
    icon: BarChart3,
    desc: "Track results over time",
  },
  {
    href: "/features/lead-capture",
    label: "Lead Capture",
    icon: Megaphone,
    desc: "Convert visitors into clients",
  },
];

const COMPARE_LINKS = [
  { href: "/compare/trainerize", label: "DawFit vs Trainerize" },
  { href: "/compare/truecoach", label: "DawFit vs TrueCoach" },
  { href: "/compare/everfit", label: "DawFit vs Everfit" },
];

export function MarketingNav() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto relative z-50">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center">
          <span className="text-white font-bold text-sm">D</span>
        </div>
        <span className="text-white font-bold text-xl">DawFit</span>
      </Link>

      {/* Center links */}
      <div className="hidden md:flex items-center gap-1">
        {/* Features dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-1 px-3 py-2 text-slate-300 hover:text-white text-sm font-medium transition-colors rounded-md hover:bg-slate-700/50">
            Features <ChevronDown className="h-3.5 w-3.5 opacity-70 group-hover:rotate-180 transition-transform duration-200" />
          </button>
          <div className="absolute top-full left-0 pt-1 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2">
              {FEATURES.map(({ href, label, icon: Icon, desc }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-700/60 transition-colors group/item"
                >
                  <div className="h-8 w-8 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium group-hover/item:text-indigo-300 transition-colors">
                      {label}
                    </p>
                    <p className="text-slate-400 text-xs">{desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Compare dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-1 px-3 py-2 text-slate-300 hover:text-white text-sm font-medium transition-colors rounded-md hover:bg-slate-700/50">
            Compare <ChevronDown className="h-3.5 w-3.5 opacity-70 group-hover:rotate-180 transition-transform duration-200" />
          </button>
          <div className="absolute top-full left-0 pt-1 w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2">
              {COMPARE_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <Link
          href="/pricing"
          className="px-3 py-2 text-slate-300 hover:text-white text-sm font-medium transition-colors rounded-md hover:bg-slate-700/50"
        >
          Pricing
        </Link>
      </div>

      {/* Auth buttons */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          asChild
          className="text-slate-300 hover:text-white hover:bg-slate-700"
        >
          <Link href="/auth/login">Sign in</Link>
        </Button>
        <Button asChild className="bg-indigo-500 hover:bg-indigo-600">
          <Link href="/auth/signup">Start Free</Link>
        </Button>
      </div>
    </nav>
  );
}
