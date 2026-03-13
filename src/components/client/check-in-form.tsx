"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitCheckIn } from "@/app/client/check-in/actions";
import { CheckCircle2, MessageSquare } from "lucide-react";

interface ExistingCheckIn {
  id: string;
  sleep_quality: number | null;
  stress_level: number | null;
  soreness_level: number | null;
  weight: number | null;
  weight_unit: string | null;
  notes: string | null;
  submitted_at: string;
}

interface HistoryEntry {
  week_start_date: string;
  sleep_quality: number | null;
  stress_level: number | null;
  soreness_level: number | null;
  weight: number | null;
  weight_unit: string | null;
  coach_notes: string | null;
  reviewed_at: string | null;
}

interface Props {
  weekStartDate: string;
  existing: ExistingCheckIn | null;
  history: HistoryEntry[];
}

const ratingLabels: Record<number, string> = { 1: "Very bad", 2: "Poor", 3: "Okay", 4: "Good", 5: "Great" };

function RatingPicker({ value, onChange, disabled }: { value: number | null; onChange: (v: number) => void; disabled?: boolean }) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          disabled={disabled}
          className={cn(
            "flex-1 py-2 rounded-lg text-sm font-medium transition-colors border",
            value === n
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50"
          )}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

export function CheckInForm({ weekStartDate, existing, history }: Props) {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(!!existing);
  const [sleep, setSleep] = useState<number | null>(existing?.sleep_quality ?? null);
  const [stress, setStress] = useState<number | null>(existing?.stress_level ?? null);
  const [soreness, setSoreness] = useState<number | null>(existing?.soreness_level ?? null);
  const [weight, setWeight] = useState<string>(existing?.weight?.toString() ?? "");
  const [weightUnit, setWeightUnit] = useState<"lbs" | "kg">((existing?.weight_unit as "lbs" | "kg") ?? "lbs");
  const [notes, setNotes] = useState<string>(existing?.notes ?? "");

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await submitCheckIn(formData);
      setSubmitted(true);
    });
  }

  if (submitted && existing) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-green-900">Check-in submitted!</p>
            <p className="text-sm text-green-700 mt-0.5">Your coach will review this soon.</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <h3 className="font-medium text-slate-900 text-sm">This week&apos;s summary</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Sleep", value: existing.sleep_quality },
              { label: "Stress", value: existing.stress_level },
              { label: "Soreness", value: existing.soreness_level },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-slate-900">{value ?? "—"}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                {value && <p className="text-xs text-slate-400">{ratingLabels[value]}</p>}
              </div>
            ))}
          </div>
          {existing.weight && (
            <p className="text-sm text-slate-600 text-center">
              Weight: <span className="font-medium">{existing.weight} {existing.weight_unit ?? "lbs"}</span>
            </p>
          )}
          {existing.notes && (
            <div className="pt-2 border-t">
              <p className="text-xs text-slate-500 mb-1">Notes</p>
              <p className="text-sm text-slate-700">{existing.notes}</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setSubmitted(false)}
          className="text-sm text-blue-600 hover:underline"
        >
          Edit this week&apos;s check-in
        </button>

        {/* History */}
        {history.length > 0 && <HistorySection history={history} />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form action={handleSubmit} className="space-y-6">
        <input type="hidden" name="week_start_date" value={weekStartDate} />

        {/* Sleep quality */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-1">
            Sleep quality <span className="text-slate-400 font-normal">last 7 days</span>
          </label>
          <RatingPicker value={sleep} onChange={setSleep} disabled={isPending} />
          {sleep && <p className="text-xs text-slate-400 mt-1 text-center">{ratingLabels[sleep]}</p>}
          <input type="hidden" name="sleep_quality" value={sleep ?? ""} />
        </div>

        {/* Stress */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-1">
            Stress level <span className="text-slate-400 font-normal">1 = very low, 5 = very high</span>
          </label>
          <RatingPicker value={stress} onChange={setStress} disabled={isPending} />
          {stress && <p className="text-xs text-slate-400 mt-1 text-center">{ratingLabels[stress]}</p>}
          <input type="hidden" name="stress_level" value={stress ?? ""} />
        </div>

        {/* Soreness */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-1">
            Muscle soreness <span className="text-slate-400 font-normal">1 = none, 5 = very sore</span>
          </label>
          <RatingPicker value={soreness} onChange={setSoreness} disabled={isPending} />
          {soreness && <p className="text-xs text-slate-400 mt-1 text-center">{ratingLabels[soreness]}</p>}
          <input type="hidden" name="soreness_level" value={soreness ?? ""} />
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-1">
            Body weight <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              name="weight"
              min={0}
              step={0.1}
              placeholder="e.g. 175"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              className="flex-1"
              disabled={isPending}
            />
            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              {(["lbs", "kg"] as const).map(u => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setWeightUnit(u)}
                  className={cn(
                    "px-3 py-2 text-sm font-medium transition-colors",
                    weightUnit === u ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          <input type="hidden" name="weight_unit" value={weightUnit} />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-1">
            Notes <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            name="notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="How are you feeling? Anything your coach should know?"
            rows={3}
            disabled={isPending}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isPending || !sleep || !stress || !soreness}
        >
          {isPending ? "Submitting..." : existing ? "Update Check-In" : "Submit Check-In"}
        </Button>
      </form>

      {/* History */}
      {history.length > 0 && <HistorySection history={history} />}
    </div>
  );
}

function HistorySection({ history }: { history: HistoryEntry[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Previous Check-ins</h3>
      <div className="space-y-3">
        {history.map(ci => (
          <div key={ci.week_start_date} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-900">
                Week of {new Date(ci.week_start_date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
              {ci.reviewed_at && (
                <span className="text-xs text-green-600 font-medium">Coach reviewed</span>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              {ci.sleep_quality && <span>Sleep {ci.sleep_quality}/5</span>}
              {ci.stress_level && <span>Stress {ci.stress_level}/5</span>}
              {ci.soreness_level && <span>Soreness {ci.soreness_level}/5</span>}
              {ci.weight && <span>{ci.weight} {ci.weight_unit ?? "lbs"}</span>}
            </div>
            {ci.coach_notes && (
              <div className="mt-2 pt-2 border-t flex gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-600">{ci.coach_notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
