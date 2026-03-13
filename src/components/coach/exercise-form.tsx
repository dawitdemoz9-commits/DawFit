"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { createExercise, updateExercise } from "@/app/dashboard/exercises/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Exercise } from "@/types/database";

const CATEGORIES = ["strength", "cardio", "core", "mobility", "plyometrics", "other"];

const MUSCLE_GROUPS = [
  "chest", "back", "shoulders", "biceps", "triceps", "forearms",
  "core", "quads", "hamstrings", "glutes", "calves", "adductors",
  "lats", "traps", "lower_back", "rear_delt", "front_delt",
];

const EQUIPMENT_OPTIONS = [
  "barbell", "dumbbell", "kettlebell", "cable", "machine",
  "pull_up_bar", "dip_bar", "bench", "rack", "bands", "bodyweight",
  "treadmill", "rower", "assault_bike", "jump_rope",
];

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      {isEditing ? "Save changes" : "Create exercise"}
    </Button>
  );
}

interface Props {
  exercise?: Exercise;
}

export function ExerciseForm({ exercise }: Props) {
  const isEditing = !!exercise;
  const [error, setError] = useState<string | null>(null);
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>(exercise?.muscle_groups ?? []);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(exercise?.equipment ?? []);

  function toggleItem(list: string[], setList: (v: string[]) => void, item: string) {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  }

  async function handleAction(formData: FormData) {
    setError(null);
    // Inject multi-select values (checkboxes not natively reliable in server actions)
    selectedMuscles.forEach(m => formData.append("muscle_groups", m));
    selectedEquipment.forEach(e => formData.append("equipment", e));

    let result;
    if (isEditing) {
      result = await updateExercise(exercise.id, formData);
    } else {
      result = await createExercise(formData);
    }
    if (result?.error) setError(result.error);
  }

  return (
    <form action={handleAction} className="space-y-5">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="name">Exercise name *</Label>
        <Input id="name" name="name" defaultValue={exercise?.name} placeholder="e.g. Romanian Deadlift" required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          name="category"
          defaultValue={exercise?.category ?? ""}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">Select category...</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c} className="capitalize">{c}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={exercise?.description ?? ""} placeholder="Brief description of the exercise" rows={2} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="instructions">Instructions / Cues</Label>
        <Textarea id="instructions" name="instructions" defaultValue={exercise?.instructions ?? ""} placeholder="Step-by-step coaching cues..." rows={4} />
      </div>

      <div className="space-y-2">
        <Label>Muscle groups</Label>
        <div className="flex flex-wrap gap-2">
          {MUSCLE_GROUPS.map(m => (
            <button
              key={m}
              type="button"
              onClick={() => toggleItem(selectedMuscles, setSelectedMuscles, m)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors capitalize ${
                selectedMuscles.includes(m)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              {m.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Equipment needed</Label>
        <div className="flex flex-wrap gap-2">
          {EQUIPMENT_OPTIONS.map(eq => (
            <button
              key={eq}
              type="button"
              onClick={() => toggleItem(selectedEquipment, setSelectedEquipment, eq)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors capitalize ${
                selectedEquipment.includes(eq)
                  ? "bg-slate-800 text-white border-slate-800"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              {eq.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="video_url">Video URL <span className="text-slate-400 font-normal">(optional)</span></Label>
        <Input id="video_url" name="video_url" type="url" defaultValue={exercise?.video_url ?? ""} placeholder="https://youtube.com/..." />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_public"
          name="is_public"
          value="true"
          defaultChecked={exercise?.is_public ?? false}
          className="h-4 w-4 rounded border-input"
        />
        <Label htmlFor="is_public" className="font-normal">Share with other DawFit coaches</Label>
      </div>

      <div className="flex gap-2 pt-2">
        <SubmitButton isEditing={isEditing} />
      </div>
    </form>
  );
}
