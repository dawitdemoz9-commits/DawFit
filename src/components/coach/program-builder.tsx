"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Plus, Trash2, ChevronDown, Dumbbell, Clock, ExternalLink, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  addWeekToProgram,
  addWorkoutToWeek,
  removeWorkoutFromWeek,
  deleteWeek,
  updateWeek,
} from "@/app/dashboard/programs/actions";
import type { Program } from "@/types/database";

const DAY_LABELS = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface Week {
  id: string;
  week_number: number;
  label: string | null;
  notes: string | null;
}

interface WorkoutRow {
  id: string;
  title: string;
  week_id: string | null;
  day_of_week: number | null;
  order_index: number;
  status: "draft" | "published";
  estimated_duration_min: number | null;
}

interface ProgramBuilderProps {
  program: Program;
  weeks: Week[];
  workouts: WorkoutRow[];
  exerciseCountMap: Record<string, number>;
}

export function ProgramBuilder({ program, weeks: initialWeeks, workouts: initialWorkouts, exerciseCountMap }: ProgramBuilderProps) {
  const [weeks, setWeeks] = useState<Week[]>(initialWeeks);
  const [workouts, setWorkouts] = useState<WorkoutRow[]>(initialWorkouts);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(
    new Set(initialWeeks.slice(0, 3).map(w => w.id)) // Open first 3 weeks by default
  );
  const [addingWorkoutWeek, setAddingWorkoutWeek] = useState<string | null>(null);
  const [newWorkoutTitle, setNewWorkoutTitle] = useState("");
  const [isPending, startTransition] = useTransition();

  function toggleWeek(weekId: string) {
    setExpandedWeeks(prev => {
      const next = new Set(prev);
      next.has(weekId) ? next.delete(weekId) : next.add(weekId);
      return next;
    });
  }

  function handleAddWeek() {
    startTransition(async () => {
      const result = await addWeekToProgram(program.id);
      if (result?.data) {
        setWeeks(prev => [...prev, result.data]);
        setExpandedWeeks(prev => new Set([...prev, result.data.id]));
      }
    });
  }

  function handleDeleteWeek(weekId: string) {
    setWeeks(prev => prev.filter(w => w.id !== weekId));
    setWorkouts(prev => prev.filter(w => w.week_id !== weekId));
    startTransition(async () => {
      await deleteWeek(weekId, program.id);
    });
  }

  async function handleAddWorkout(weekId: string) {
    if (!newWorkoutTitle.trim()) return;
    const title = newWorkoutTitle.trim();
    setNewWorkoutTitle("");
    setAddingWorkoutWeek(null);

    const tempId = `temp-${Date.now()}`;
    const tempWorkout: WorkoutRow = {
      id: tempId,
      title,
      week_id: weekId,
      day_of_week: null,
      order_index: workouts.filter(w => w.week_id === weekId).length,
      status: "draft",
      estimated_duration_min: null,
    };
    setWorkouts(prev => [...prev, tempWorkout]);

    startTransition(async () => {
      const result = await addWorkoutToWeek(weekId, program.id, title);
      if (result?.data) {
        setWorkouts(prev => prev.map(w => w.id === tempId ? result.data : w));
      }
    });
  }

  function handleRemoveWorkout(workoutId: string) {
    setWorkouts(prev => prev.filter(w => w.id !== workoutId));
    startTransition(async () => {
      await removeWorkoutFromWeek(workoutId, program.id);
    });
  }

  return (
    <div className="p-6 space-y-4 max-w-3xl">
      {weeks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 rounded-xl">
          <p className="text-slate-400 text-sm mb-3">No weeks yet — add your first week to start building</p>
          <Button onClick={handleAddWeek} disabled={isPending}>
            <Plus className="h-4 w-4 mr-2" />Add Week 1
          </Button>
        </div>
      ) : (
        weeks.map((week) => {
          const weekWorkouts = workouts
            .filter(w => w.week_id === week.id)
            .sort((a, b) => a.order_index - b.order_index);
          const isExpanded = expandedWeeks.has(week.id);

          return (
            <div key={week.id} className="bg-white border rounded-xl overflow-hidden">
              {/* Week header */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => toggleWeek(week.id)}
              >
                <GripVertical className="h-4 w-4 text-slate-300" />
                <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform flex-shrink-0", isExpanded && "rotate-180")} />
                <div className="flex-1">
                  <WeekLabel
                    weekId={week.id}
                    programId={program.id}
                    label={week.label ?? `Week ${week.week_number}`}
                    weekNumber={week.week_number}
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{weekWorkouts.length} workout{weekWorkouts.length !== 1 ? "s" : ""}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteWeek(week.id); }}
                  className="text-slate-300 hover:text-red-400 transition-colors p-1 ml-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Week body */}
              {isExpanded && (
                <div className="border-t px-4 py-3 space-y-2 bg-slate-50/50">
                  {weekWorkouts.length === 0 && (
                    <p className="text-slate-400 text-xs py-2 text-center">No workouts in this week yet</p>
                  )}

                  {weekWorkouts.map((wo) => (
                    <div key={wo.id} className="flex items-center gap-3 bg-white border rounded-lg px-3 py-2.5 group">
                      <GripVertical className="h-3.5 w-3.5 text-slate-300 cursor-grab" />
                      {wo.day_of_week && (
                        <Badge variant="outline" className="text-xs w-10 justify-center flex-shrink-0">
                          {DAY_LABELS[wo.day_of_week]}
                        </Badge>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{wo.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                          {exerciseCountMap[wo.id] !== undefined && (
                            <span className="flex items-center gap-1">
                              <Dumbbell className="h-2.5 w-2.5" />
                              {exerciseCountMap[wo.id]} exercises
                            </span>
                          )}
                          {wo.estimated_duration_min && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" />
                              {wo.estimated_duration_min}m
                            </span>
                          )}
                          <Badge
                            variant={wo.status === "published" ? "success" : "secondary"}
                            className="text-xs h-4"
                          >
                            {wo.status}
                          </Badge>
                        </div>
                      </div>
                      <Link
                        href={`/dashboard/workouts/${wo.id}`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-primary p-1"
                        onClick={e => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        onClick={() => !wo.id.startsWith("temp-") && handleRemoveWorkout(wo.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-400 p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Add workout inline */}
                  {addingWorkoutWeek === week.id ? (
                    <div className="flex gap-2 mt-1">
                      <Input
                        autoFocus
                        value={newWorkoutTitle}
                        onChange={e => setNewWorkoutTitle(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") handleAddWorkout(week.id);
                          if (e.key === "Escape") { setAddingWorkoutWeek(null); setNewWorkoutTitle(""); }
                        }}
                        placeholder="Workout name, e.g. Upper Body A..."
                        className="h-8 text-sm"
                      />
                      <Button size="sm" className="h-8 text-xs" onClick={() => handleAddWorkout(week.id)}>Add</Button>
                      <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => { setAddingWorkoutWeek(null); setNewWorkoutTitle(""); }}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingWorkoutWeek(week.id)}
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-primary transition-colors py-1 w-full"
                    >
                      <Plus className="h-3.5 w-3.5" />Add workout
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}

      <Button
        variant="outline"
        className="w-full border-dashed"
        onClick={handleAddWeek}
        disabled={isPending}
      >
        <Plus className="h-4 w-4 mr-2" />Add Week {weeks.length + 1}
      </Button>
    </div>
  );
}

// Inline editable week label
function WeekLabel({
  weekId,
  programId,
  label,
  weekNumber,
}: {
  weekId: string;
  programId: string;
  label: string;
  weekNumber: number;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(label);
  const [, startTransition] = useTransition();

  function handleBlur() {
    setEditing(false);
    if (value !== label) {
      startTransition(async () => {
        await updateWeek(weekId, programId, { label: value });
      });
    }
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={e => e.key === "Enter" && handleBlur()}
        onClick={e => e.stopPropagation()}
        className="text-sm font-semibold text-slate-900 bg-transparent border-b border-primary outline-none w-full max-w-xs"
      />
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-slate-900">{label || `Week ${weekNumber}`}</span>
      <button
        onClick={e => { e.stopPropagation(); setEditing(true); }}
        className="text-slate-300 hover:text-slate-500 transition-colors opacity-0 group-hover:opacity-100 text-xs"
      >
        edit
      </button>
    </div>
  );
}
