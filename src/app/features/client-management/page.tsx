import type { Metadata } from "next";
import { FeaturePageLayout } from "@/components/marketing/feature-page-layout";
import { Users, MessageSquare, TrendingUp, Bell } from "lucide-react";

export const metadata: Metadata = {
  title: "DawFit Client Management Software for Fitness Coaches",
  description:
    "Manage every client in one place. Track check-ins, deliver programs, message clients, and monitor progress without juggling spreadsheets.",
};

export default function ClientManagementPage() {
  return (
    <FeaturePageLayout
      icon={Users}
      eyebrow="Client Management"
      headline={
        <>
          Manage every client
          <br />
          <span className="text-indigo-400">without the chaos</span>
        </>
      }
      subheadline="Stop juggling spreadsheets and DMs. DawFit gives you a dedicated space for every client — programs, check-ins, messages, and progress, all in one dashboard."
      screenshotLabel="Client Dashboard"
      screenshotAccent="bg-gradient-to-br from-indigo-900/40 to-slate-900"
      benefits={[
        {
          icon: Users,
          title: "Centralized Client Profiles",
          desc: "See every client's program, check-in history, workout logs, and notes at a glance. No switching tabs, no digging through DMs.",
        },
        {
          icon: MessageSquare,
          title: "Built-in Messaging",
          desc: "Message clients directly inside DawFit. No more scattered WhatsApp threads or email chains — all context stays with the client.",
        },
        {
          icon: Bell,
          title: "Check-in Tracking",
          desc: "Clients submit weekly check-ins with photos, measurements, and mood. You review and respond from your dashboard.",
        },
      ]}
      steps={[
        {
          title: "Add or invite a client",
          desc: "Invite a client by email. They create their account and are instantly linked to your dashboard.",
        },
        {
          title: "Assign a training program",
          desc: "Pick from your program library and assign it with one click. The client sees their full weekly schedule immediately.",
        },
        {
          title: "Track check-ins week by week",
          desc: "Clients submit weekly check-ins. You review progress, leave feedback, and adjust programs as needed.",
        },
        {
          title: "Message and retain long-term",
          desc: "Use built-in messaging to keep clients engaged, answer questions, and celebrate milestones.",
        },
      ]}
      ctaHeadline="Ready to organize your coaching business?"
    />
  );
}
