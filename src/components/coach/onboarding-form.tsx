"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { completeOnboarding } from "@/app/onboarding/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const SPECIALTIES = [
  { value: "strength", label: "Strength & Powerlifting", emoji: "🏋️" },
  { value: "bodybuilding", label: "Bodybuilding / Physique", emoji: "💪" },
  { value: "crossfit", label: "CrossFit / Functional", emoji: "⚡" },
  { value: "general", label: "General Fitness", emoji: "🎯" },
  { value: "cardio", label: "Cardio / Endurance", emoji: "🏃" },
];

const BRAND_COLORS = [
  "#3B82F6", // Blue
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#EF4444", // Red
  "#06B6D4", // Cyan
  "#F97316", // Orange
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" size="lg" loading={pending}>
      Launch my coaching portal
    </Button>
  );
}

export function OnboardingForm({ defaultName }: { defaultName: string }) {
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(BRAND_COLORS[0]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(["general"]);

  function toggleSpecialty(value: string) {
    setSelectedSpecialties((prev) =>
      prev.includes(value)
        ? prev.length === 1 ? prev : prev.filter((s) => s !== value)
        : [...prev, value]
    );
  }

  async function handleAction(formData: FormData) {
    setError(null);
    formData.set("brand_color", selectedColor);
    formData.set("specialty", selectedSpecialties.join(","));
    const result = await completeOnboarding(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <form action={handleAction} className="space-y-5">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="full_name">Your full name</Label>
        <Input
          id="full_name"
          name="full_name"
          defaultValue={defaultName}
          placeholder="Alex Johnson"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="business_name">Business / brand name</Label>
        <Input
          id="business_name"
          name="business_name"
          placeholder="Alex Johnson Fitness"
          required
        />
        <p className="text-xs text-slate-400">This appears on your public application page</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          placeholder="Tell potential clients about your coaching philosophy, experience, and specialties..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>Coaching specialty</Label>
        <p className="text-xs text-slate-400">Select all that apply — we&apos;ll seed your exercise library accordingly</p>
        <div className="grid grid-cols-1 gap-2">
          {SPECIALTIES.map((s) => {
            const selected = selectedSpecialties.includes(s.value);
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => toggleSpecialty(s.value)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium transition-colors text-left ${
                  selected
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <span className="text-lg">{s.emoji}</span>
                <span className="flex-1">{s.label}</span>
                {selected && <span className="text-blue-500 text-xs font-semibold">✓</span>}
              </button>
            );
          })}
        </div>
        <input type="hidden" name="specialty" value={selectedSpecialties.join(",")} />
      </div>

      <div className="space-y-2">
        <Label>Brand color</Label>
        <div className="flex gap-2 flex-wrap">
          {BRAND_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setSelectedColor(color)}
              className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none"
              style={{
                backgroundColor: color,
                borderColor: selectedColor === color ? color : "transparent",
                boxShadow: selectedColor === color ? `0 0 0 3px white, 0 0 0 5px ${color}` : "none",
              }}
            />
          ))}
        </div>
        <input type="hidden" name="brand_color" value={selectedColor} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="instagram_url">Instagram <span className="text-slate-400 font-normal">(optional)</span></Label>
        <Input
          id="instagram_url"
          name="instagram_url"
          type="url"
          placeholder="https://instagram.com/yourhandle"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="website_url">Website <span className="text-slate-400 font-normal">(optional)</span></Label>
        <Input
          id="website_url"
          name="website_url"
          type="url"
          placeholder="https://yoursite.com"
        />
      </div>

      <SubmitButton />
    </form>
  );
}
