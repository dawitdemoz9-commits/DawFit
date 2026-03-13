"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExerciseSearchProps {
  categories: string[];
}

export function ExerciseSearch({ categories }: ExerciseSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, val] of Object.entries(updates)) {
        if (val) params.set(key, val);
        else params.delete(key);
      }
      startTransition(() => {
        router.push(`/dashboard/exercises?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const currentCategory = searchParams.get("category");
  const currentSource = searchParams.get("source");

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search exercises..."
            defaultValue={searchParams.get("q") ?? ""}
            className="pl-9"
            onChange={(e) => updateParams({ q: e.target.value || undefined })}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Source filter */}
        {(["all", "mine", "platform"] as const).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={(!currentSource && s === "all") || currentSource === s ? "default" : "outline"}
            className="h-7 text-xs capitalize"
            onClick={() => updateParams({ source: s === "all" ? undefined : s })}
          >
            {s === "all" ? "All" : s === "mine" ? "My Exercises" : "Platform"}
          </Button>
        ))}

        <div className="w-px bg-slate-200 mx-1" />

        {/* Category filter */}
        {categories.map((cat) => (
          <Button
            key={cat}
            size="sm"
            variant={currentCategory === cat ? "default" : "outline"}
            className={cn("h-7 text-xs capitalize", isPending && "opacity-50")}
            onClick={() => updateParams({ category: currentCategory === cat ? undefined : cat })}
          >
            {cat}
          </Button>
        ))}
      </div>
    </div>
  );
}
