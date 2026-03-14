import type { Metadata } from "next";
import { FeaturePageLayout } from "@/components/marketing/feature-page-layout";
import { ClipboardList, Zap, CalendarDays, Library } from "lucide-react";

export const metadata: Metadata = {
  title: "DawFit Program Builder — Create Training Programs in Minutes",
  description:
    "Build structured multi-week training programs, add exercises from your library, and assign them to clients instantly. No more copy-pasting spreadsheets.",
};

export default function ProgramBuilderPage() {
  return (
    <FeaturePageLayout
      icon={ClipboardList}
      eyebrow="Program Builder"
      headline={
        <>
          Build training programs
          <br />
          <span className="text-indigo-400">in minutes, not hours</span>
        </>
      }
      subheadline="Create professional multi-week training programs, add exercises from your library, and deliver them to clients with one click. No spreadsheets required."
      screenshotLabel="Program Builder"
      screenshotAccent="bg-gradient-to-br from-violet-900/40 to-slate-900"
      benefits={[
        {
          icon: CalendarDays,
          title: "Multi-Week Structure",
          desc: "Organize programs into weeks and days. Clients see exactly what to do each day — sets, reps, rest, and coaching notes.",
        },
        {
          icon: Library,
          title: "Exercise Library",
          desc: "Build and reuse your own exercise library. Add custom exercises with instructions, video links, and muscle groups.",
        },
        {
          icon: Zap,
          title: "AI-Generated Programs",
          desc: "Describe the client's goals and let AI generate a full program draft. Edit and assign in minutes.",
        },
      ]}
      steps={[
        {
          title: "Create a new program",
          desc: "Name the program, set the number of weeks, and pick a focus (strength, hypertrophy, conditioning, etc.).",
        },
        {
          title: "Add workouts and exercises",
          desc: "Build each workout by adding exercises from your library. Set sets, reps, tempo, and notes per exercise.",
        },
        {
          title: "Assign to a client",
          desc: "Pick a client and assign the program. Choose a start date and the program goes live on their dashboard.",
        },
        {
          title: "Client executes and logs",
          desc: "Clients log each workout session. You see their results, weights used, and RPE in your dashboard.",
        },
      ]}
      ctaHeadline="Start building better programs today"
    />
  );
}
