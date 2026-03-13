"use client";

import { useState, useTransition } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const EQUIPMENT_OPTIONS = [
  "Barbell", "Dumbbells", "Kettlebells", "Pull-up bar",
  "Cable machine", "Resistance bands", "Bodyweight only", "Full gym",
];

const MUSCLE_OPTIONS = [
  "Chest", "Back", "Shoulders", "Biceps", "Triceps",
  "Quads", "Hamstrings", "Glutes", "Calves", "Core",
  "Full body", "Upper body", "Lower body",
];

type Step = "config" | "generating" | "error";

export function GenerateWorkoutDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("config");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [sessionDuration, setSessionDuration] = useState(60);
  const [experience, setExperience] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [intensity, setIntensity] = useState<"low" | "moderate" | "high">("moderate");
  const [equipment, setEquipment] = useState<string[]>(["Full gym"]);
  const [targetMuscles, setTargetMuscles] = useState<string[]>(["Full body"]);
  const [notes, setNotes] = useState("");

  function toggleItem<T>(arr: T[], item: T): T[] {
    return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];
  }

  function handleGenerate() {
    if (!title.trim()) return;
    setStep("generating");
    setError("");

    startTransition(async () => {
      try {
        const res = await fetch("/api/ai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "workout",
            constraints: {
              title: title.trim(),
              session_duration_min: sessionDuration,
              equipment,
              target_muscle_groups: targetMuscles,
              experience_level: experience,
              intensity,
              additional_notes: notes,
            },
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setStep("error");
          setError(data.error ?? "Generation failed");
          return;
        }

        setOpen(false);
        setStep("config");
        router.push(`/dashboard/ai/${data.draft_id}`);
      } catch {
        setStep("error");
        setError("Network error — please try again");
      }
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={o => { setOpen(o); if (!o) setStep("config"); }}>
      <Dialog.Trigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Generate Workout
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl animate-in fade-in zoom-in-95">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <Dialog.Title className="text-base font-semibold text-slate-900">Generate AI Workout</Dialog.Title>
            </div>
            <Dialog.Close className="text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="p-6 space-y-5">
            {step === "generating" && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-4" />
                <p className="font-medium text-slate-900">Building your workout...</p>
                <p className="text-sm text-slate-500 mt-1">Usually takes 5–10 seconds</p>
              </div>
            )}

            {step === "error" && (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm font-medium text-red-700">Generation failed</p>
                  <p className="text-xs text-red-600 mt-1">{error}</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep("config")} className="flex-1">Edit</Button>
                  <Button onClick={handleGenerate} disabled={isPending} className="flex-1">Retry</Button>
                </div>
              </div>
            )}

            {step === "config" && (
              <>
                <div>
                  <label className="text-sm font-medium text-slate-900 mb-1 block">Workout title</label>
                  <Input placeholder="e.g. Upper Push A" value={title} onChange={e => setTitle(e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700 mb-1 block">Duration (min)</label>
                    <Input type="number" min={20} max={180} step={5} value={sessionDuration} onChange={e => setSessionDuration(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 mb-1 block">Intensity</label>
                    <select
                      value={intensity}
                      onChange={e => setIntensity(e.target.value as "low" | "moderate" | "high")}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="moderate">Moderate</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-900 mb-1.5 block">Experience level</label>
                  <div className="flex gap-2">
                    {(["beginner", "intermediate", "advanced"] as const).map(lvl => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setExperience(lvl)}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-xs font-medium transition-colors border capitalize",
                          experience === lvl
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                        )}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-900 mb-1.5 block">Equipment</label>
                  <div className="flex flex-wrap gap-1.5">
                    {EQUIPMENT_OPTIONS.map(eq => (
                      <button key={eq} type="button" onClick={() => setEquipment(toggleItem(equipment, eq))}
                        className={cn("px-3 py-1 rounded-full text-xs font-medium transition-colors border",
                          equipment.includes(eq) ? "bg-blue-100 text-blue-700 border-blue-300" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        )}>
                        {eq}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-900 mb-1.5 block">Target muscles</label>
                  <div className="flex flex-wrap gap-1.5">
                    {MUSCLE_OPTIONS.map(m => (
                      <button key={m} type="button" onClick={() => setTargetMuscles(toggleItem(targetMuscles, m))}
                        className={cn("px-3 py-1 rounded-full text-xs font-medium transition-colors border",
                          targetMuscles.includes(m) ? "bg-purple-100 text-purple-700 border-purple-300" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        )}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-900 mb-1 block">Notes <span className="text-slate-400 font-normal">(optional)</span></label>
                  <textarea rows={2} placeholder="Any special instructions..." value={notes} onChange={e => setNotes(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <Button onClick={handleGenerate} disabled={isPending || !title.trim()} className="w-full gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generate Workout
                </Button>
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
