"use client";

import { useState, useTransition } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { generateExercisesBulk } from "@/app/dashboard/exercises/actions";

const CATEGORIES = ["strength", "cardio", "core", "mobility", "plyometrics", "crossfit", "hiit"];

export function BulkExerciseDialog() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("strength");
  const [focus, setFocus] = useState("");
  const [count, setCount] = useState(20);
  const [result, setResult] = useState<{ success?: boolean; count?: number; error?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    setResult(null);
    startTransition(async () => {
      const res = await generateExercisesBulk(category, focus, count);
      setResult(res);
      if (res.success) {
        setTimeout(() => setOpen(false), 2000);
      }
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="outline">
          <Sparkles className="h-4 w-4 mr-2" />
          AI Generate Exercises
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <Dialog.Title className="text-lg font-semibold">AI Generate Exercises</Dialog.Title>
              <p className="text-sm text-slate-400 mt-0.5">Add exercises to your library in bulk</p>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon"><X className="h-4 w-4" /></Button>
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            {result?.error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                {result.error}
              </div>
            )}
            {result?.success && (
              <div className="rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
                Added {result.count} exercises to your library!
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Category</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                      category === c
                        ? "bg-blue-500 text-white border-blue-500"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="focus">Focus / style <span className="text-slate-400 font-normal">(optional)</span></Label>
              <Input
                id="focus"
                value={focus}
                onChange={e => setFocus(e.target.value)}
                placeholder="e.g. glutes, athletes, HIIT, women's fitness..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="count">Number of exercises</Label>
              <div className="flex items-center gap-3">
                {[10, 20, 30, 50].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCount(n)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      count === n
                        ? "bg-blue-500 text-white border-blue-500"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleGenerate}
              disabled={isPending}
              loading={isPending}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isPending ? "Generating..." : `Generate ${count} exercises`}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
