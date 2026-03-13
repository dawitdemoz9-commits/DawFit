"use client";

import { useState, useTransition } from "react";
import {
  ChevronDown, ChevronUp, Check, X, Sparkles,
  Edit2, AlertTriangle, Dumbbell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  approveProgramDraft,
  approveWorkoutDraft,
  rejectDraft,
  updateDraftContent,
} from "@/app/dashboard/ai/actions";
import type { AIProgramDraft, AIWorkoutOnlyDraft, AIExercise } from "@/lib/ai/prompts";

// ─── Program Draft Review ─────────────────────────────────────────────────────

interface ProgramDraftReviewProps {
  draftId: string;
  clientName: string | null;
  initialDraft: AIProgramDraft;
}

export function ProgramDraftReview({ draftId, clientName, initialDraft }: ProgramDraftReviewProps) {
  const [draft, setDraft] = useState<AIProgramDraft>(initialDraft);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));
  const [isPending, startTransition] = useTransition();
  const [editingTitle, setEditingTitle] = useState(false);

  function toggleWeek(num: number) {
    setExpandedWeeks(prev => {
      const next = new Set(prev);
      next.has(num) ? next.delete(num) : next.add(num);
      return next;
    });
  }

  function updateExercise(weekIdx: number, workoutIdx: number, exIdx: number, field: keyof AIExercise, value: string | number | null) {
    setDraft(prev => {
      const next = structuredClone(prev);
      const ex = next.weeks[weekIdx].workouts[workoutIdx].exercises[exIdx];
      next.weeks[weekIdx].workouts[workoutIdx].exercises[exIdx] = { ...ex, [field]: value };
      return next;
    });
  }

  function handleSaveEdits() {
    startTransition(async () => {
      await updateDraftContent(draftId, draft);
    });
  }

  function handleApprove() {
    startTransition(async () => {
      await updateDraftContent(draftId, draft);
      await approveProgramDraft(draftId);
    });
  }

  function handleReject() {
    startTransition(async () => {
      await rejectDraft(draftId);
    });
  }

  const totalWorkouts = draft.weeks.reduce((a, w) => a + w.workouts.length, 0);
  const totalExercises = draft.weeks.reduce((a, w) => a + w.workouts.reduce((b, wo) => b + wo.exercises.length, 0), 0);

  return (
    <div className="space-y-6">
      {/* Program header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-blue-500 shrink-0" />
              <span className="text-xs text-blue-600 font-medium uppercase tracking-wide">AI Draft — Pending Review</span>
            </div>
            {editingTitle ? (
              <Input
                value={draft.title}
                onChange={e => setDraft(p => ({ ...p, title: e.target.value }))}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={e => e.key === "Enter" && setEditingTitle(false)}
                className="text-xl font-bold mb-2"
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-2 group">
                <h2 className="text-xl font-bold text-slate-900">{draft.title}</h2>
                <button onClick={() => setEditingTitle(true)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit2 className="h-3.5 w-3.5 text-slate-400" />
                </button>
              </div>
            )}
            {clientName && <p className="text-sm text-slate-500">For: {clientName}</p>}
            <p className="text-sm text-slate-600 mt-1">{draft.description}</p>
          </div>
          <div className="flex flex-col gap-1 text-right text-sm text-slate-500 shrink-0">
            <span>{draft.duration_weeks} weeks</span>
            <span>{totalWorkouts} sessions</span>
            <span>{totalExercises} exercises</span>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-800">
          Review all exercises and prescriptions before approving. Approving will create a real program in your library ready to assign.
        </p>
      </div>

      {/* Weeks */}
      <div className="space-y-3">
        {draft.weeks.map((week, wi) => (
          <div key={wi} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors"
              onClick={() => toggleWeek(week.week_number)}
            >
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600">
                  {week.week_number}
                </div>
                <span className="font-medium text-slate-900 text-sm">{week.label}</span>
                {week.notes && <span className="text-xs text-slate-400 hidden sm:block">— {week.notes}</span>}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">{week.workouts.length} sessions</span>
                {expandedWeeks.has(week.week_number)
                  ? <ChevronUp className="h-4 w-4 text-slate-400" />
                  : <ChevronDown className="h-4 w-4 text-slate-400" />
                }
              </div>
            </button>

            {expandedWeeks.has(week.week_number) && (
              <div className="border-t border-slate-100 divide-y divide-slate-100">
                {week.workouts.map((wo, woi) => (
                  <div key={woi} className="px-5 py-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Dumbbell className="h-3.5 w-3.5 text-slate-400" />
                      <h4 className="text-sm font-semibold text-slate-800">{wo.title}</h4>
                      <span className="text-xs text-slate-400 ml-auto">{wo.estimated_duration_min} min</span>
                    </div>

                    {/* Exercise table */}
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_2fr] gap-2 text-xs font-medium text-slate-400 uppercase tracking-wide pb-1">
                        <span>Exercise</span>
                        <span className="text-center">Sets</span>
                        <span className="text-center">Reps</span>
                        <span className="text-center">Load</span>
                        <span>Rest</span>
                      </div>
                      {wo.exercises.map((ex, ei) => (
                        <div key={ei} className="grid grid-cols-[2fr_1fr_1fr_1fr_2fr] gap-2 items-center">
                          <span className="text-xs text-slate-700 font-medium truncate" title={ex.exercise_name}>
                            {ex.exercise_name}
                          </span>
                          <Input
                            type="number"
                            min={1}
                            value={ex.sets}
                            onChange={e => updateExercise(wi, woi, ei, "sets", Number(e.target.value))}
                            className="h-7 text-center text-xs px-1"
                          />
                          <Input
                            value={ex.reps}
                            onChange={e => updateExercise(wi, woi, ei, "reps", e.target.value)}
                            className="h-7 text-center text-xs px-1"
                            placeholder="8-10"
                          />
                          <Input
                            value={ex.load}
                            onChange={e => updateExercise(wi, woi, ei, "load", e.target.value)}
                            className="h-7 text-center text-xs px-1"
                            placeholder="RPE 7"
                          />
                          <Input
                            type="number"
                            min={0}
                            value={ex.rest_seconds}
                            onChange={e => updateExercise(wi, woi, ei, "rest_seconds", Number(e.target.value))}
                            className="h-7 text-xs px-2"
                            placeholder="90s"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="sticky bottom-0 bg-white border-t pt-4 pb-2 flex gap-3">
        <Button variant="outline" onClick={handleSaveEdits} disabled={isPending} className="flex-1">
          Save edits
        </Button>
        <Button variant="outline" onClick={handleReject} disabled={isPending} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
          <X className="h-4 w-4 mr-1.5" />
          Reject
        </Button>
        <Button onClick={handleApprove} disabled={isPending} className="flex-1 bg-green-600 hover:bg-green-700">
          <Check className="h-4 w-4 mr-1.5" />
          {isPending ? "Creating..." : "Approve & Create Program"}
        </Button>
      </div>
    </div>
  );
}

// ─── Workout Draft Review ─────────────────────────────────────────────────────

interface WorkoutDraftReviewProps {
  draftId: string;
  initialDraft: AIWorkoutOnlyDraft;
}

export function WorkoutDraftReview({ draftId, initialDraft }: WorkoutDraftReviewProps) {
  const [draft, setDraft] = useState<AIWorkoutOnlyDraft>(initialDraft);
  const [isPending, startTransition] = useTransition();

  function updateExercise(idx: number, field: keyof AIExercise, value: string | number | null) {
    setDraft(prev => {
      const next = structuredClone(prev);
      next.exercises[idx] = { ...next.exercises[idx], [field]: value };
      return next;
    });
  }

  function handleApprove() {
    startTransition(async () => {
      await updateDraftContent(draftId, draft);
      await approveWorkoutDraft(draftId);
    });
  }

  function handleReject() {
    startTransition(async () => {
      await rejectDraft(draftId);
    });
  }

  function handleSave() {
    startTransition(async () => {
      await updateDraftContent(draftId, draft);
    });
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-blue-500" />
          <span className="text-xs text-blue-600 font-medium uppercase tracking-wide">AI Draft — Workout</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900">{draft.title}</h2>
        {draft.description && <p className="text-sm text-slate-600 mt-1">{draft.description}</p>}
        <p className="text-xs text-slate-400 mt-1">{draft.estimated_duration_min} min · {draft.exercises.length} exercises</p>
      </div>

      <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-800">
          Approving will create a workout in your library. You can then edit it fully in the workout builder.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_2fr] gap-2 text-xs font-medium text-slate-400 uppercase tracking-wide pb-2 border-b mb-2">
          <span>Exercise</span>
          <span className="text-center">Sets</span>
          <span className="text-center">Reps</span>
          <span className="text-center">Load</span>
          <span>Rest (s)</span>
        </div>
        <div className="space-y-2">
          {draft.exercises.map((ex, ei) => (
            <div key={ei} className="grid grid-cols-[2fr_1fr_1fr_1fr_2fr] gap-2 items-center">
              <span className="text-xs text-slate-700 font-medium truncate" title={ex.exercise_name}>
                {ex.exercise_name}
              </span>
              <Input type="number" min={1} value={ex.sets} onChange={e => updateExercise(ei, "sets", Number(e.target.value))} className="h-7 text-center text-xs px-1" />
              <Input value={ex.reps} onChange={e => updateExercise(ei, "reps", e.target.value)} className="h-7 text-center text-xs px-1" />
              <Input value={ex.load} onChange={e => updateExercise(ei, "load", e.target.value)} className="h-7 text-center text-xs px-1" />
              <Input type="number" min={0} value={ex.rest_seconds} onChange={e => updateExercise(ei, "rest_seconds", Number(e.target.value))} className="h-7 text-xs px-2" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={handleSave} disabled={isPending} className="flex-1">Save edits</Button>
        <Button variant="outline" onClick={handleReject} disabled={isPending} className="text-red-600 hover:bg-red-50 border-red-200">
          <X className="h-4 w-4 mr-1.5" />Reject
        </Button>
        <Button onClick={handleApprove} disabled={isPending} className="flex-1 bg-green-600 hover:bg-green-700">
          <Check className="h-4 w-4 mr-1.5" />
          {isPending ? "Creating..." : "Approve & Create Workout"}
        </Button>
      </div>
    </div>
  );
}
