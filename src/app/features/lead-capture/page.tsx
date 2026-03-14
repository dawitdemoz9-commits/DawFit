import type { Metadata } from "next";
import { FeaturePageLayout } from "@/components/marketing/feature-page-layout";
import { LeadPipelineMockup } from "@/components/marketing/mockups";
import { Megaphone, Link2, LayoutDashboard, UserCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "DawFit Lead Capture — Turn Visitors Into Paying Coaching Clients",
  description:
    "Get a public application page, collect lead details, manage your pipeline, and convert leads to clients with one click. No extra tools needed.",
};

export default function LeadCapturePage() {
  return (
    <FeaturePageLayout
      icon={Megaphone}
      eyebrow="Lead Capture"
      headline={
        <>
          Turn visitors into
          <br />
          <span className="text-indigo-400">paying clients automatically</span>
        </>
      }
      subheadline="Get a shareable application page for your coaching business. Collect leads, review applications, and convert them to full clients — all without leaving DawFit."
      Mockup={LeadPipelineMockup}
      benefits={[
        {
          icon: Link2,
          title: "Public Application Page",
          desc: "Every coach gets a branded /apply page they can share on Instagram, TikTok, or their website. No code required.",
        },
        {
          icon: LayoutDashboard,
          title: "Lead Pipeline View",
          desc: "See all leads in a kanban-style pipeline: New → Contacted → Qualified. Move leads through stages as you talk to them.",
        },
        {
          icon: UserCheck,
          title: "One-Click Conversion",
          desc: "When a lead is ready, convert them to a client in one click. They receive an invite email and are linked to your dashboard.",
        },
      ]}
      steps={[
        {
          title: "Share your application link",
          desc: "Copy your unique /apply/[your-name] link and share it on social media, in your bio, or via email.",
        },
        {
          title: "Visitors submit their application",
          desc: "Leads fill out a short form with their goals, availability, budget, and health notes. You get notified.",
        },
        {
          title: "Review and qualify leads",
          desc: "Browse applications in your pipeline. Move leads through stages and track where each conversation stands.",
        },
        {
          title: "Convert and onboard instantly",
          desc: "Hit Convert to Client — DawFit sends an invite email, creates their account, and links them to your dashboard.",
        },
      ]}
      ctaHeadline="Start filling your client roster"
    />
  );
}
