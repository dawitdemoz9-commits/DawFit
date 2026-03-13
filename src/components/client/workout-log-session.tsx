"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, ChevronDown, ChevronUp, ArrowLeft, Timer, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { updateSetLog, addSetToExerciseLog, completeWorkoutLog, skipWorkoutLog } from "@/app/client/log/actions";

interface SetLogData {
  id: string;
  set_number: number;
  reps_completed: number | null;
  load: number | null;
  load_unit: string;
  rpe: number | null;
  completed: boolean;
}

interface ExerciseLogData {
  id: string;
  exercise_id: string;
  order_index: number;
  notes: string | null;
  exercise_name: string;
  exercise_category: string | null;
  prescribed_sets: number | null;
  prescribed_reps: string | null;
  prescribed_load: string | null;
  rest_seconds: number | null;
  sets: SetLogData[];
}

interface WorkoutLogSessionProps {
  logId: string;
  workoutTitle: string;
  workoutDescription: string | null;
  exerciseLogs: ExerciseLogData[];
}

export function WorkoutLogSession({ logId, workoutTitle, workoutDescription, exerciseLogs: initial }: WorkoutLogSessionProps) {
  const router = useRouter();
  const [exercises, setExercises] = useState<ExerciseLogData[]>(initial);
  const [expandedEx, setExpandedEx] = useState<string | null>(initial[0]?.id ?? null);
  const [isPending, startTransition] = useTransition();
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [showComplete, setShowComplete] = useState(false);
  const [overallRpe, setOverallRpe] = useState<number | null>(null);
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);
  const [completionNotes, setCompletionNotes] = useState("");
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [elapsedMin, setElapsedMin] = useState(0);

  // Elapsed timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedMin(Math.floor((Date.now() - startTimeRef.current) / 60000));
    }, 30000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Rest countdown
  useEffect(() => {
    if (restTimer === null || restTimer <= 0) return;
    const t = setTimeout(() => setRestTimer(r => (r ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [restTimer]);

  const completedSets = exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const allDone = totalSets > 0 && completedSets === totalSets;

  function updateLocalSet(exId: string, setId: string, field: keyof SetLogData, value: string | number | boolean | null) {
    setExercises(prev => prev.map(ex =>
      ex.id === exId
        ? { ...ex, sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s) }
        : ex
    ));
  }

  function handleSetBlur(exId: string, set: SetLogData) {
    startTransition(async () => {
      await updateSetLog(set.id, {
        reps_completed: set.reps_completed,
        load: set.load,
        load_unit: set.load_unit,
        rpe: set.rpe,
      });
    });
  }

  function handleCompleteSet(exId: string, set: SetLogData, restSecs: number | null) {
    const newCompleted = !set.completed;
    updateLocalSet(exId, set.id, "completed", newCompleted);
    startTransition(async () => {
      await updateSetLog(set.id, {
        reps_completed: set.reps_completed,
        load: set.load,
        load_unit: set.load_unit,
        rpe: set.rpe,
        completed: newCompleted,
      });
    });
    if (newCompleted && restSecs) {
      setRestTimer(restSecs);
    }
  }

  function handleAddSet(ex: ExerciseLogData) {
    const nextSetNum = (ex.sets[ex.sets.length - 1]?.set_number ?? 0) + 1;
    startTransition(async () => {
      const newSet = await addSetToExerciseLog(ex.id, nextSetNum);
      if (newSet) {
        setExercises(prev => prev.map(e =>
          e.id === ex.id
            ? { ...e, sets: [...e.sets, { ...newSet, load_unit: newSet.load_unit ?? "lbs", completed: newSet.completed ?? false }] }
            : e
        ));
      }
    });
  }

  function handleFinish() {
    startTransition(async () => {
      await completeWorkoutLog(logId, {
        duration_min: elapsedMin || 1,
        overall_rpe: overallRpe ?? undefined,
        energy_level: energyLevel ?? undefined,
        notes: completionNotes || undefined,
      });
    });
  }

  function handleSkip() {
    startTransition(async () => {
      await skipWorkoutLog(logId);
    });
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-slate-600">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-slate-900 truncate">{workoutTitle}</h1>
          {workoutDescription && <p className="text-xs text-slate-500 truncate">{workoutDescription}</p>}
        </div>
        <div className="flex items-center gap-1.5 text-slate-500 text-sm">
          <Timer className="h-4 w-4" />
          <span>{elapsedMin}m</span>
        </div>
      </div>

      {/* Rest timer banner */}
      {restTimer !== null && restTimer > 0 && (
        <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between">
          <span className="text-sm font-medium">Rest timer</span>
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-lg">
              {Math.floor(restTimer / 60)}:{String(restTimer % 60).padStart(2, "0")}
            </span>
            <button onClick={() => setRestTimer(null)} className="text-blue-200 hover:text-white text-xs underline">
              skip
            </button>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="h-1 bg-slate-200">
        <div
          className="h-full bg-green-500 transition-all duration-300"
          style={{ width: `${totalSets > 0 ? (completedSets / totalSets) * 100 : 0}%` }}
        />
      </div>

      {/* Exercise list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {exercises.map((ex) => {
          const isOpen = expandedEx === ex.id;
          const exDone = ex.sets.length > 0 && ex.sets.every(s => s.completed);
          return (
            <div key={ex.id} className={cn("bg-white rounded-xl border transition-colors", exDone ? "border-green-200" : "border-slate-200")}>
              {/* Exercise header */}
              <button
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
                onClick={() => setExpandedEx(isOpen ? null : ex.id)}
              >
                <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
                  exDone ? "bg-green-100" : "bg-slate-100"
                )}>
                  {exDone
                    ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                    : <span className="text-xs font-bold text-slate-500">{ex.order_index + 1}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">{ex.exercise_name}</p>
                  <p className="text-xs text-slate-500">
                    {ex.prescribed_sets ? `${ex.prescribed_sets} × ` : ""}{ex.prescribed_reps ?? "—"} reps
                    {ex.prescribed_load ? ` @ ${ex.prescribed_load}` : ""}
                    {" · "}
                    {ex.sets.filter(s => s.completed).length}/{ex.sets.length} sets done
                  </p>
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
              </button>

              {/* Sets table */}
              {isOpen && (
                <div className="border-t border-slate-100 px-4 pb-3">
                  {/* Column headers */}
                  <div className="grid grid-cols-[2rem_1fr_1fr_1fr_2.5rem] gap-2 py-2 text-xs font-medium text-slate-400 uppercase tracking-wide">
                    <span className="text-center">Set</span>
                    <span className="text-center">Reps</span>
                    <span className="text-center">Load</span>
                    <span className="text-center">RPE</span>
                    <span />
                  </div>
                  {ex.sets.map((set) => (
                    <div
                      key={set.id}
                      className={cn(
                        "grid grid-cols-[2rem_1fr_1fr_1fr_2.5rem] gap-2 items-center py-1.5",
                        set.completed && "opacity-60"
                      )}
                    >
                      <span className="text-center text-sm font-medium text-slate-600">{set.set_number}</span>
                      <Input
                        type="number"
                        min={0}
                        placeholder={ex.prescribed_reps ?? "—"}
                        value={set.reps_completed ?? ""}
                        onChange={e => updateLocalSet(ex.id, set.id, "reps_completed", e.target.value ? Number(e.target.value) : null)}
                        onBlur={() => handleSetBlur(ex.id, set)}
                        className="h-8 text-center text-sm"
                        disabled={set.completed}
                      />
                      <Input
                        type="number"
                        min={0}
                        step={0.5}
                        placeholder={ex.prescribed_load ?? "—"}
                        value={set.load ?? ""}
                        onChange={e => updateLocalSet(ex.id, set.id, "load", e.target.value ? Number(e.target.value) : null)}
                        onBlur={() => handleSetBlur(ex.id, set)}
                        className="h-8 text-center text-sm"
                        disabled={set.completed}
                      />
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        placeholder="1-10"
                        value={set.rpe ?? ""}
                        onChange={e => updateLocalSet(ex.id, set.id, "rpe", e.target.value ? Number(e.target.value) : null)}
                        onBlur={() => handleSetBlur(ex.id, set)}
                        className="h-8 text-center text-sm"
                        disabled={set.completed}
                      />
                      <button
                        onClick={() => handleCompleteSet(ex.id, set, ex.rest_seconds)}
                        className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
                          set.completed
                            ? "bg-green-500 text-white"
                            : "bg-slate-100 text-slate-400 hover:bg-green-100 hover:text-green-600"
                        )}
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => handleAddSet(ex)}
                    disabled={isPending}
                    className="mt-2 flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add set
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom actions */}
      {!showComplete ? (
        <div className="bg-white border-t p-4 flex gap-3">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isPending}
            className="flex-1"
          >
            Skip
          </Button>
          <Button
            onClick={() => setShowComplete(true)}
            disabled={isPending}
            className={cn("flex-1", allDone ? "bg-green-600 hover:bg-green-700" : "")}
          >
            {allDone ? "Finish Workout" : "Finish Early"}
          </Button>
        </div>
      ) : (
        <div className="bg-white border-t p-4 space-y-4">
          <h3 className="font-semibold text-slate-900">How did it go?</h3>
          {/* Overall RPE */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Overall effort (RPE 1-10)</label>
            <div className="flex gap-1.5">
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <button
                  key={n}
                  onClick={() => setOverallRpe(n)}
                  className={cn(
                    "h-8 w-8 rounded-lg text-sm font-medium transition-colors",
                    overallRpe === n ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          {/* Energy */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Energy level (1-5)</label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(n => (
                <button
                  key={n}
                  onClick={() => setEnergyLevel(n)}
                  className={cn(
                    "h-8 w-8 rounded-lg text-sm font-medium transition-colors",
                    energyLevel === n ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Notes (optional)</label>
            <textarea
              value={completionNotes}
              onChange={e => setCompletionNotes(e.target.value)}
              placeholder="Anything worth noting..."
              rows={2}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowComplete(false)} className="flex-1" disabled={isPending}>
              Back
            </Button>
            <Button onClick={handleFinish} disabled={isPending} className="flex-1 bg-green-600 hover:bg-green-700">
              {isPending ? "Saving..." : "Save & Finish"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
