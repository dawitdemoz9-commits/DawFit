"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { createWorkout } from "@/app/dashboard/workouts/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>Create &amp; add exercises</Button>
  );
}

export function WorkoutMetaForm() {
  const [error, setError] = useState<string | null>(null);

  async function handleAction(formData: FormData) {
    setError(null);
    const result = await createWorkout(formData);
    if (result?.error) setError(result.error);
  }

  return (
    <form action={handleAction} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">{error}</div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="title">Workout name *</Label>
        <Input id="title" name="title" placeholder="e.g. Lower Body Power A" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Notes <span className="text-slate-400 font-normal">(optional)</span></Label>
        <Textarea id="description" name="description" placeholder="Brief description or coaching notes..." rows={2} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="estimated_duration_min">Estimated duration (minutes)</Label>
        <Input id="estimated_duration_min" name="estimated_duration_min" type="number" min={5} max={300} placeholder="60" />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="is_template" name="is_template" value="true" className="h-4 w-4 rounded border-input" />
        <Label htmlFor="is_template" className="font-normal">Save as reusable template</Label>
      </div>
      <SubmitButton />
    </form>
  );
}
