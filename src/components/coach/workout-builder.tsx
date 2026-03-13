"use client";

import { useState, useTransition } from "react";
import { Grip, Plus, Trash2, ChevronDown, Check, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  addExerciseToWorkout,
  updateWorkoutExercise,
  removeExerciseFromWorkout,
  reorderWorkoutExercises,
  updateWorkoutMeta,
} from "@/app/dashboard/workouts/actions";
import type { Workout } from "@/types/database";

interface ExerciseRow {
  id: string;
  workout_id: string;
  exercise_id: string;
  order_index: number;
  sets: number | null;
  reps: string | null;
  load: string | null;
  rest_seconds: number | null;
  tempo: string | null;
  notes: string | null;
  exercises: {
    id: string;
    name: string;
    category: string | null;
    muscle_groups: string[] | null;
  } | null;
}

interface ExerciseOption {
  id: string;
  name: string;
  category: string | null;
  muscle_groups: string[] | null;
}

interface WorkoutBuilderProps {
  workout: Workout;
  initialExercises: ExerciseRow[];
  allExercises: ExerciseOption[];
}

export function WorkoutBuilder({ workout, initialExercises, allExercises }: WorkoutBuilderProps) {
  const [exercises, setExercises] = useState<ExerciseRow[]>(initialExercises);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [publishStatus, setPublishStatus] = useState(workout.status);

  const filteredExercises = allExercises.filter(
    (e) =>
      e.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      (e.category ?? "").toLowerCase().includes(pickerSearch.toLowerCase())
  );

  function handleAddExercise(exercise: ExerciseOption) {
    const newRow: ExerciseRow = {
      id: `temp-${Date.now()}`,
      workout_id: workout.id,
      exercise_id: exercise.id,
      order_index: exercises.length,
      sets: 3,
      reps: "8-10",
      load: null,
      rest_seconds: 90,
      tempo: null,
      notes: null,
      exercises: exercise as ExerciseRow["exercises"],
    };
    setExercises(prev => [...prev, newRow]);
    setShowPicker(false);
    setPickerSearch("");

    startTransition(async () => {
      const result = await addExerciseToWorkout(workout.id, exercise.id, exercises.length);
      if (result?.data) {
        // Replace temp row with real row from DB
        setExercises(prev =>
          prev.map(r => r.id === newRow.id ? { ...result.data, exercises: exercise as ExerciseRow["exercises"] } : r)
        );
      }
    });
  }

  function handleFieldChange(rowId: string, field: keyof ExerciseRow, value: string | number | null) {
    setExercises(prev => prev.map(r => r.id === rowId ? { ...r, [field]: value } : r));
  }

  function handleFieldBlur(row: ExerciseRow) {
    if (row.id.startsWith("temp-")) return;
    startTransition(async () => {
      await updateWorkoutExercise(row.id, {
        sets: row.sets ?? undefined,
        reps: row.reps ?? undefined,
        load: row.load ?? undefined,
        rest_seconds: row.rest_seconds ?? undefined,
        tempo: row.tempo ?? undefined,
        notes: row.notes ?? undefined,
      });
    });
  }

  function handleRemove(rowId: string) {
    setExercises(prev => prev.filter(r => r.id !== rowId));
    if (!rowId.startsWith("temp-")) {
      startTransition(async () => {
        await removeExerciseFromWorkout(rowId, workout.id);
      });
    }
  }

  function handleTogglePublish() {
    const next = publishStatus === "published" ? "draft" : "published";
    setPublishStatus(next);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("title", workout.title);
      fd.set("status", next);
      await updateWorkoutMeta(workout.id, fd);
    });
  }

  return (
    <div className="flex h-full">
      {/* Main exercise list */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-600">
            {exercises.length} exercise{exercises.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={publishStatus === "published" ? "default" : "outline"}
              onClick={handleTogglePublish}
              disabled={isPending}
              className="text-xs"
            >
              {publishStatus === "published" ? (
                <><Check className="h-3 w-3 mr-1" />Published</>
              ) : "Publish"}
            </Button>
          </div>
        </div>

        {exercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 rounded-xl">
            <p className="text-slate-400 text-sm mb-3">No exercises yet</p>
            <Button onClick={() => setShowPicker(true)}>
              <Plus className="h-4 w-4 mr-2" />Add First Exercise
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {exercises.map((row, idx) => (
              <ExerciseCard
                key={row.id}
                row={row}
                index={idx}
                isExpanded={expandedRow === row.id}
                onToggleExpand={() => setExpandedRow(expandedRow === row.id ? null : row.id)}
                onFieldChange={handleFieldChange}
                onFieldBlur={handleFieldBlur}
                onRemove={() => handleRemove(row.id)}
              />
            ))}
          </div>
        )}

        <Button
          variant="outline"
          className="w-full border-dashed"
          onClick={() => setShowPicker(true)}
        >
          <Plus className="h-4 w-4 mr-2" />Add Exercise
        </Button>
      </div>

      {/* Exercise Picker Panel */}
      {showPicker && (
        <div className="w-80 border-l bg-white flex flex-col h-full">
          <div className="p-4 border-b flex items-center justify-between">
            <p className="font-semibold text-slate-900 text-sm">Add Exercise</p>
            <button onClick={() => { setShowPicker(false); setPickerSearch(""); }}>
              <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
            </button>
          </div>
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                autoFocus
                value={pickerSearch}
                onChange={e => setPickerSearch(e.target.value)}
                placeholder="Search exercises..."
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {filteredExercises.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">No results</p>
            ) : (
              filteredExercises.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => handleAddExercise(ex)}
                  className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <p className="text-sm font-medium text-slate-800">{ex.name}</p>
                  <div className="flex gap-1 mt-0.5">
                    {ex.category && (
                      <span className="text-xs text-slate-400 capitalize">{ex.category}</span>
                    )}
                    {(ex.muscle_groups ?? []).slice(0, 2).map(m => (
                      <span key={m} className="text-xs text-slate-300 capitalize">· {m.replace("_", " ")}</span>
                    ))}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface ExerciseCardProps {
  row: ExerciseRow;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onFieldChange: (rowId: string, field: keyof ExerciseRow, value: string | number | null) => void;
  onFieldBlur: (row: ExerciseRow) => void;
  onRemove: () => void;
}

function ExerciseCard({ row, index, isExpanded, onToggleExpand, onFieldChange, onFieldBlur, onRemove }: ExerciseCardProps) {
  const ex = row.exercises;

  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      {/* Row header */}
      <div className="flex items-center gap-3 p-3">
        <div className="flex items-center gap-2 text-slate-300 cursor-grab">
          <Grip className="h-4 w-4" />
          <span className="text-xs font-mono text-slate-400 w-4">{index + 1}</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900 text-sm">{ex?.name ?? "Unknown"}</p>
          {ex?.category && (
            <p className="text-xs text-slate-400 capitalize">{ex.category}</p>
          )}
        </div>

        {/* Quick fields */}
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-slate-400">Sets</span>
            <Input
              value={row.sets ?? ""}
              onChange={e => onFieldChange(row.id, "sets", e.target.value ? Number(e.target.value) : null)}
              onBlur={() => onFieldBlur(row)}
              className="w-12 h-6 text-xs px-1.5 text-center"
              type="number"
              min={1}
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-slate-400">Reps</span>
            <Input
              value={row.reps ?? ""}
              onChange={e => onFieldChange(row.id, "reps", e.target.value || null)}
              onBlur={() => onFieldBlur(row)}
              className="w-16 h-6 text-xs px-1.5 text-center"
              placeholder="8-10"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-slate-400">Load</span>
            <Input
              value={row.load ?? ""}
              onChange={e => onFieldChange(row.id, "load", e.target.value || null)}
              onBlur={() => onFieldBlur(row)}
              className="w-20 h-6 text-xs px-1.5"
              placeholder="135 lbs"
            />
          </div>
        </div>

        <button onClick={onToggleExpand} className="text-slate-400 hover:text-slate-600 p-1">
          <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
        </button>
        <button onClick={onRemove} className="text-slate-300 hover:text-red-500 p-1 transition-colors">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t bg-slate-50/50 pt-3 grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-medium">Sets</label>
            <Input
              value={row.sets ?? ""}
              onChange={e => onFieldChange(row.id, "sets", e.target.value ? Number(e.target.value) : null)}
              onBlur={() => onFieldBlur(row)}
              type="number" min={1} className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-medium">Reps / Duration</label>
            <Input
              value={row.reps ?? ""}
              onChange={e => onFieldChange(row.id, "reps", e.target.value || null)}
              onBlur={() => onFieldBlur(row)}
              placeholder="8-10 or AMRAP or 30s"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-medium">Load / Intensity</label>
            <Input
              value={row.load ?? ""}
              onChange={e => onFieldChange(row.id, "load", e.target.value || null)}
              onBlur={() => onFieldBlur(row)}
              placeholder="135 lbs / 75% 1RM"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-medium">Rest (seconds)</label>
            <Input
              value={row.rest_seconds ?? ""}
              onChange={e => onFieldChange(row.id, "rest_seconds", e.target.value ? Number(e.target.value) : null)}
              onBlur={() => onFieldBlur(row)}
              type="number" placeholder="90"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-medium">Tempo</label>
            <Input
              value={row.tempo ?? ""}
              onChange={e => onFieldChange(row.id, "tempo", e.target.value || null)}
              onBlur={() => onFieldBlur(row)}
              placeholder="3-0-1-0"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1 col-span-2">
            <label className="text-xs text-slate-500 font-medium">Coach notes</label>
            <Input
              value={row.notes ?? ""}
              onChange={e => onFieldChange(row.id, "notes", e.target.value || null)}
              onBlur={() => onFieldBlur(row)}
              placeholder="Cue: brace core, hinge from hips..."
              className="h-8 text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}
