"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ApplyFormProps {
  coachId: string;
  coachSlug: string;
  brandColor: string;
  source: string;
}

export function ApplyForm({ coachId, coachSlug, brandColor, source }: ApplyFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const body = {
      coach_id: coachId,
      source,
      full_name: formData.get("full_name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      goals: formData.get("goals"),
      experience_level: formData.get("experience_level"),
      availability: formData.get("availability"),
      budget_range: formData.get("budget_range"),
      health_notes: formData.get("health_notes"),
    };

    const res = await fetch("/api/leads/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    router.push(`/apply/${coachSlug}/success`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Full name *</Label>
          <Input id="full_name" name="full_name" placeholder="Your name" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">Phone <span className="text-slate-400 font-normal">(optional)</span></Label>
        <Input id="phone" name="phone" type="tel" placeholder="+1 (555) 000-0000" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="goals">What are your main fitness goals? *</Label>
        <Textarea
          id="goals"
          name="goals"
          placeholder="e.g., Lose 20 lbs, build strength, train for a marathon..."
          rows={3}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="experience_level">Training experience level *</Label>
        <select
          id="experience_level"
          name="experience_level"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          required
        >
          <option value="">Select level...</option>
          <option value="beginner">Beginner (0–1 years)</option>
          <option value="intermediate">Intermediate (1–3 years)</option>
          <option value="advanced">Advanced (3+ years)</option>
          <option value="athlete">Competitive athlete</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="availability">How many days per week can you train? *</Label>
        <select
          id="availability"
          name="availability"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          required
        >
          <option value="">Select...</option>
          <option value="2-3">2–3 days</option>
          <option value="3-4">3–4 days</option>
          <option value="4-5">4–5 days</option>
          <option value="5+">5+ days</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="budget_range">Monthly coaching budget</Label>
        <select
          id="budget_range"
          name="budget_range"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">Prefer not to say</option>
          <option value="under-200">Under $200/mo</option>
          <option value="200-400">$200–$400/mo</option>
          <option value="400-600">$400–$600/mo</option>
          <option value="600+">$600+/mo</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="health_notes">Any injuries, health conditions, or limitations?</Label>
        <Textarea
          id="health_notes"
          name="health_notes"
          placeholder="e.g., Bad lower back, previous knee surgery..."
          rows={2}
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        loading={loading}
        style={{ backgroundColor: brandColor }}
      >
        Submit Application
      </Button>
    </form>
  );
}
