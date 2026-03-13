"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { createProgram } from "@/app/dashboard/programs/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>Create program</Button>
  );
}

export function ProgramMetaForm() {
  const [error, setError] = useState<string | null>(null);

  async function handleAction(formData: FormData) {
    setError(null);
    const result = await createProgram(formData);
    if (result?.error) setError(result.error);
  }

  return (
    <form action={handleAction} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">{error}</div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="title">Program name *</Label>
        <Input id="title" name="title" placeholder="e.g. 12-Week Hypertrophy Block" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Description <span className="text-slate-400 font-normal">(optional)</span></Label>
        <Textarea id="description" name="description" placeholder="Goals, methodology, who it's for..." rows={3} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="duration_weeks">Duration (weeks)</Label>
        <Input
          id="duration_weeks"
          name="duration_weeks"
          type="number"
          min={1}
          max={52}
          placeholder="12"
        />
        <p className="text-xs text-slate-400">Weeks will be auto-created. You can add more later.</p>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="is_template" name="is_template" value="true" className="h-4 w-4 rounded border-input" />
        <Label htmlFor="is_template" className="font-normal">Save as reusable template</Label>
      </div>
      <SubmitButton />
    </form>
  );
}
