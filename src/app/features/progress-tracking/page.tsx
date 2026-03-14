import type { Metadata } from "next";
import { FeaturePageLayout } from "@/components/marketing/feature-page-layout";
import { BarChart3, ClipboardCheck, TrendingUp, Camera } from "lucide-react";

export const metadata: Metadata = {
  title: "DawFit Progress Tracking — See Client Results Over Time",
  description:
    "Track workout logs, weekly check-ins, and body metrics in one dashboard. Spot trends before clients notice them and adjust programs proactively.",
};

export default function ProgressTrackingPage() {
  return (
    <FeaturePageLayout
      icon={BarChart3}
      eyebrow="Progress Tracking"
      headline={
        <>
          See client progress
          <br />
          <span className="text-indigo-400">before they notice it</span>
        </>
      }
      subheadline="Clients log workouts and submit weekly check-ins. You see the full picture — weights, body metrics, mood, and trends — so you can coach proactively."
      screenshotLabel="Progress Dashboard"
      screenshotAccent="bg-gradient-to-br from-emerald-900/30 to-slate-900"
      benefits={[
        {
          icon: ClipboardCheck,
          title: "Weekly Check-Ins",
          desc: "Clients complete structured weekly check-ins covering weight, energy, sleep, photos, and how they felt. You review and respond.",
        },
        {
          icon: TrendingUp,
          title: "Workout Logs",
          desc: "Every workout session is logged with actual weights, sets completed, and RPE. Track strength progress over time.",
        },
        {
          icon: Camera,
          title: "Transformation Tracking",
          desc: "Upload before/after photos and generate a shareable transformation page clients can post on social media.",
        },
      ]}
      steps={[
        {
          title: "Client logs a workout",
          desc: "After each session, clients log the weights and reps they actually hit. Takes less than 60 seconds.",
        },
        {
          title: "Client submits weekly check-in",
          desc: "Once per week, clients fill out a short check-in covering body weight, mood, sleep quality, and notes.",
        },
        {
          title: "You review in your dashboard",
          desc: "See all check-ins and logs side by side. Spot trends — is energy dropping? Are weights plateauing?",
        },
        {
          title: "Adjust the program proactively",
          desc: "Use what you see to make smart program adjustments before the client realizes they need a change.",
        },
      ]}
      ctaHeadline="Start tracking what actually matters"
    />
  );
}
