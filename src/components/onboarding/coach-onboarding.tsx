import Link from "next/link";
import { CheckIcon, ClipboardList, UserPlus, Layers, Share2, ExternalLink, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CoachOnboardingProps {
  hasProgram: boolean;
  hasClient: boolean;
  hasProgramAssigned: boolean;
  coachSlug: string | null;
  appUrl: string;
}

const STEPS = [
  {
    id: "program",
    icon: ClipboardList,
    title: "Create your first program",
    desc: "Build a multi-week training program from your library.",
    href: "/dashboard/programs/new",
    cta: "Build Program",
  },
  {
    id: "client",
    icon: UserPlus,
    title: "Add or invite your first client",
    desc: "Invite a client by email — they get portal access instantly.",
    href: "/dashboard/clients",
    cta: "Invite Client",
  },
  {
    id: "assign",
    icon: Layers,
    title: "Assign a program to your client",
    desc: "Open a client profile and assign a training program to get them started.",
    href: "/dashboard/clients",
    cta: "Open Clients",
  },
  {
    id: "share",
    icon: Share2,
    title: "Share your client portal link",
    desc: "Send your /apply page to attract new leads for your coaching business.",
    href: null, // rendered separately with slug
    cta: "Copy Link",
  },
] as const;

export function CoachOnboarding({
  hasProgram,
  hasClient,
  hasProgramAssigned,
  coachSlug,
  appUrl,
}: CoachOnboardingProps) {
  const completions = [hasProgram, hasClient, hasProgramAssigned, !!coachSlug];
  const completedCount = completions.filter(Boolean).length;
  const allDone = completedCount === 4;

  // Don't show once everything is done
  if (allDone) return null;

  const applyUrl = coachSlug ? `${appUrl}/apply/${coachSlug}` : null;

  return (
    <div className="rounded-xl border border-indigo-200/40 bg-indigo-50/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/60 bg-white/40">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
            <span className="text-indigo-600 text-sm font-bold">{completedCount}/4</span>
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">Get started with DawFit</p>
            <p className="text-slate-400 text-xs">Complete these steps to start coaching clients</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          <div className="w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all"
              style={{ width: `${(completedCount / 4) * 100}%` }}
            />
          </div>
          <span className="text-xs text-slate-400">{Math.round((completedCount / 4) * 100)}%</span>
        </div>
      </div>

      {/* Steps */}
      <div className="divide-y divide-slate-200/50">
        {STEPS.map((step, i) => {
          const done = completions[i];
          const locked = !completions[i - 1] && i > 0;
          const Icon = step.icon;
          const isShareStep = step.id === "share";

          return (
            <div
              key={step.id}
              className={`flex items-center gap-4 px-5 py-4 ${
                done ? "opacity-60" : locked ? "opacity-40" : "bg-white/30"
              }`}
            >
              {/* Step indicator */}
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  done
                    ? "bg-emerald-100 border border-emerald-200"
                    : "bg-white border border-slate-300"
                }`}
              >
                {done ? (
                  <CheckIcon className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Icon className="h-4 w-4 text-slate-400" />
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${done ? "line-through text-slate-400" : "text-slate-800"}`}>
                  {step.title}
                </p>
                {!done && (
                  <p className="text-xs text-slate-400 mt-0.5 leading-snug">{step.desc}</p>
                )}
              </div>

              {/* CTA */}
              {!done && !locked && (
                isShareStep && applyUrl ? (
                  <a
                    href={applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0"
                  >
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5">
                      <ExternalLink className="h-3 w-3" />
                      View Link
                    </Button>
                  </a>
                ) : step.href ? (
                  <Link href={step.href} className="flex-shrink-0">
                    <Button size="sm" className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                      {step.cta}
                    </Button>
                  </Link>
                ) : null
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Shown on the dashboard when the coach has their very first client. */
export function FirstClientBanner({ clientId }: { clientId: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <PartyPopper className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-900">
            You&apos;re live! Your first client is now set up.
          </p>
          <p className="text-xs text-emerald-700 mt-0.5">
            They can log in, view their program, and start tracking progress.
          </p>
        </div>
      </div>
      <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-800 hover:bg-emerald-100 flex-shrink-0 h-7 text-xs" asChild>
        <Link href={`/dashboard/clients/${clientId}`}>View Client</Link>
      </Button>
    </div>
  );
}
