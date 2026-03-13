"use client";

import { useState, useTransition } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Client {
  id: string;
  name: string;
}

interface Props {
  clients: Client[];
}

const EQUIPMENT_OPTIONS = [
  "Barbell", "Dumbbells", "Kettlebells", "Pull-up bar",
  "Cable machine", "Resistance bands", "Bodyweight only",
  "Full gym", "Smith machine", "Leg press", "Cables",
];

const FOCUS_OPTIONS = [
  "Full body", "Upper body", "Lower body", "Push",
  "Pull", "Legs", "Core", "Cardio", "Strength",
  "Hypertrophy", "Power", "Endurance",
];

type Step = "config" | "generating" | "error";

export function GenerateProgramDialog({ clients }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("config");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Form state
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [durationWeeks, setDurationWeeks] = useState(8);
  const [sessionsPerWeek, setSessionsPerWeek] = useState(4);
  const [sessionDuration, setSessionDuration] = useState(60);
  const [experience, setExperience] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [equipment, setEquipment] = useState<string[]>(["Full gym"]);
  const [focusAreas, setFocusAreas] = useState<string[]>(["Full body"]);
  const [injuries, setInjuries] = useState("");
  const [notes, setNotes] = useState("");

  function toggleItem<T>(arr: T[], item: T): T[] {
    return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];
  }

  function handleGenerate() {
    if (!clientId) return;
    setStep("generating");
    setError("");

    startTransition(async () => {
      try {
        const res = await fetch("/api/ai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "program",
            client_id: clientId,
            constraints: {
              duration_weeks: durationWeeks,
              sessions_per_week: sessionsPerWeek,
              session_duration_min: sessionDuration,
              equipment,
              experience_level: experience,
              injuries_limitations: injuries,
              focus_areas: focusAreas,
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
        <Button className="gap-2">
          <Sparkles className="h-4 w-4" />
          Generate Program
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl animate-in fade-in zoom-in-95">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <Dialog.Title className="text-base font-semibold text-slate-900">Generate AI Program</Dialog.Title>
            </div>
            <Dialog.Close className="text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="p-6 space-y-5">
            {step === "generating" && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-4" />
                <p className="font-medium text-slate-900">Building your program...</p>
                <p className="text-sm text-slate-500 mt-1">This usually takes 10–20 seconds</p>
              </div>
            )}

            {step === "error" && (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm font-medium text-red-700">Generation failed</p>
                  <p className="text-xs text-red-600 mt-1">{error}</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep("config")} className="flex-1">
                    Edit settings
                  </Button>
                  <Button onClick={handleGenerate} disabled={isPending} className="flex-1">
                    Try again
                  </Button>
                </div>
              </div>
            )}

            {step === "config" && (
              <>
                {/* Client */}
                <div>
                  <label className="text-sm font-medium text-slate-900 mb-1.5 block">Client</label>
                  <select
                    value={clientId}
                    onChange={e => setClientId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Duration + frequency */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700 mb-1 block">Weeks</label>
                    <Input
                      type="number"
                      min={1}
                      max={52}
                      value={durationWeeks}
                      onChange={e => setDurationWeeks(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 mb-1 block">Days/week</label>
                    <Input
                      type="number"
                      min={1}
                      max={7}
                      value={sessionsPerWeek}
                      onChange={e => setSessionsPerWeek(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 mb-1 block">Min/session</label>
                    <Input
                      type="number"
                      min={20}
                      max={180}
                      step={5}
                      value={sessionDuration}
                      onChange={e => setSessionDuration(Number(e.target.value))}
                    />
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <label className="text-sm font-medium text-slate-900 mb-1.5 block">Experience level</label>
                  <div className="flex gap-2">
                    {(["beginner", "intermediate", "advanced"] as const).map(lvl => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setExperience(lvl)}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-sm font-medium transition-colors border capitalize",
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

                {/* Equipment */}
                <div>
                  <label className="text-sm font-medium text-slate-900 mb-1.5 block">Equipment available</label>
                  <div className="flex flex-wrap gap-1.5">
                    {EQUIPMENT_OPTIONS.map(eq => (
                      <button
                        key={eq}
                        type="button"
                        onClick={() => setEquipment(toggleItem(equipment, eq))}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium transition-colors border",
                          equipment.includes(eq)
                            ? "bg-blue-100 text-blue-700 border-blue-300"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        )}
                      >
                        {eq}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Focus areas */}
                <div>
                  <label className="text-sm font-medium text-slate-900 mb-1.5 block">Focus areas</label>
                  <div className="flex flex-wrap gap-1.5">
                    {FOCUS_OPTIONS.map(f => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFocusAreas(toggleItem(focusAreas, f))}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium transition-colors border",
                          focusAreas.includes(f)
                            ? "bg-purple-100 text-purple-700 border-purple-300"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Injuries */}
                <div>
                  <label className="text-sm font-medium text-slate-900 mb-1 block">
                    Injuries / limitations <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <Input
                    placeholder="e.g. Lower back pain, no overhead pressing"
                    value={injuries}
                    onChange={e => setInjuries(e.target.value)}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="text-sm font-medium text-slate-900 mb-1 block">
                    Additional notes <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Client trains for a powerlifting meet in 12 weeks"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isPending || !clientId}
                  className="w-full gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate Program
                </Button>
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
