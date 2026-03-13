"use client";

import { useState, useTransition } from "react";
import { Sparkles, Check, X, ChevronRight, Loader2, AlertCircle, TrendingUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { approveAdaptiveSuggestion, rejectAdaptiveSuggestion } from "@/app/dashboard/clients/[id]/adaptive-actions";
import type { AdaptiveAnalysisOutput, AdaptiveSuggestionDraft, SuggestionType } from "@/lib/ai/adaptive-prompts";

interface ExistingDraft {
  id: string;
  created_at: string;
  output: AdaptiveAnalysisOutput;
}

interface Props {
  clientId: string;
  existingDrafts: ExistingDraft[];
  // suggestions already stored in adaptive_suggestions table
  pendingSuggestions: Array<{
    id: string;
    ai_draft_id: string;
    suggestion_type: SuggestionType;
    target_week: number | null;
    rationale: string | null;
    status: string;
  }>;
}

const TYPE_LABELS: Record<SuggestionType, string> = {
  load_adjustment: "Load Adjustment",
  deload: "Deload Week",
  exercise_swap: "Exercise Swap",
  rep_change: "Rep Change",
  rest_change: "Rest Change",
};

const TYPE_COLORS: Record<SuggestionType, string> = {
  load_adjustment: "bg-blue-100 text-blue-700",
  deload: "bg-amber-100 text-amber-700",
  exercise_swap: "bg-purple-100 text-purple-700",
  rep_change: "bg-green-100 text-green-700",
  rest_change: "bg-slate-100 text-slate-600",
};

const PRIORITY_COLORS = {
  high: "text-red-600",
  medium: "text-amber-600",
  low: "text-slate-400",
};

function SuggestionCard({
  sug,
  sugId,
  draftId,
  sugIndex,
  clientId,
  alreadyReviewed,
  alreadyStatus,
}: {
  sug: AdaptiveSuggestionDraft;
  sugId: string | null;
  draftId: string;
  sugIndex: number;
  clientId: string;
  alreadyReviewed: boolean;
  alreadyStatus: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [localStatus, setLocalStatus] = useState<"pending" | "approved" | "rejected">(
    alreadyStatus === "approved" ? "approved" : alreadyStatus === "rejected" ? "rejected" : "pending"
  );

  function handleApprove() {
    if (!sugId) return;
    setLocalStatus("approved");
    startTransition(async () => {
      await approveAdaptiveSuggestion(sugId, draftId, sugIndex, clientId);
    });
  }

  function handleReject() {
    if (!sugId) return;
    setLocalStatus("rejected");
    startTransition(async () => {
      await rejectAdaptiveSuggestion(sugId, clientId);
    });
  }

  const isActedOn = localStatus !== "pending" || alreadyReviewed;

  return (
    <div className={cn(
      "border rounded-xl p-4 space-y-3 transition-opacity",
      isActedOn ? "opacity-60 bg-slate-50" : "bg-white",
      localStatus === "approved" ? "border-green-200" : localStatus === "rejected" ? "border-slate-200" : "border-slate-200"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", TYPE_COLORS[sug.suggestion_type])}>
            {TYPE_LABELS[sug.suggestion_type]}
          </span>
          <span className={cn("text-xs font-medium", PRIORITY_COLORS[sug.priority])}>
            {sug.priority} priority
          </span>
          {sug.target_week && (
            <span className="text-xs text-slate-400">Week {sug.target_week}</span>
          )}
        </div>
        {localStatus === "approved" && <span className="text-xs font-medium text-green-600">Applied</span>}
        {localStatus === "rejected" && <span className="text-xs font-medium text-slate-400">Rejected</span>}
      </div>

      {/* Change description */}
      <div>
        {sug.workout_title && (
          <p className="text-xs text-slate-500 mb-0.5">{sug.workout_title} → {sug.exercise_name ?? "Program-wide"}</p>
        )}
        <p className="text-sm font-medium text-slate-900">{sug.change_description}</p>
        {sug.current_value && sug.new_value && (
          <div className="flex items-center gap-2 mt-1.5 text-xs">
            <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded font-mono">{sug.current_value}</span>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded font-mono">{sug.new_value}</span>
          </div>
        )}
      </div>

      {/* Rationale */}
      <p className="text-xs text-slate-500 leading-relaxed">{sug.rationale}</p>

      {/* Deload note */}
      {sug.suggestion_type === "deload" && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg p-2.5">
          <AlertCircle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700">Approving this note will not auto-modify your program — you&apos;ll apply changes manually in the program builder.</p>
        </div>
      )}

      {/* Actions — only for pending */}
      {!isActedOn && sugId && (
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReject}
            disabled={isPending}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Dismiss
          </Button>
          <Button
            size="sm"
            onClick={handleApprove}
            disabled={isPending}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Check className="h-3.5 w-3.5 mr-1" />}
            {sug.suggestion_type === "deload" ? "Acknowledge" : "Apply"}
          </Button>
        </div>
      )}
    </div>
  );
}

export function AdaptiveSuggestionsPanel({ clientId, existingDrafts, pendingSuggestions }: Props) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [latestOutput, setLatestOutput] = useState<AdaptiveAnalysisOutput | null>(
    existingDrafts[0]?.output ?? null
  );
  const [latestDraftId, setLatestDraftId] = useState<string | null>(existingDrafts[0]?.id ?? null);

  async function handleAnalyze() {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const res = await fetch("/api/ai/analyze-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAnalysisError(data.error ?? "Analysis failed");
        return;
      }

      setLatestOutput(data.analysis);
      setLatestDraftId(data.draft_id);
    } catch {
      setAnalysisError("Network error — please try again");
    } finally {
      setIsAnalyzing(false);
    }
  }

  // Build a map: draftId + suggestionIndex → adaptive_suggestion row
  const sugMap = new Map<string, typeof pendingSuggestions[0]>();
  // We'll match by draft_id and position (best we can do without index stored)
  // Group pending suggestions by draft_id
  const pendingByDraft = new Map<string, typeof pendingSuggestions>();
  for (const ps of pendingSuggestions) {
    if (!pendingByDraft.has(ps.ai_draft_id)) pendingByDraft.set(ps.ai_draft_id, []);
    pendingByDraft.get(ps.ai_draft_id)!.push(ps);
  }

  return (
    <div className="space-y-5">
      {/* Header + trigger */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">AI Adaptive Suggestions</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Analyzes recent logs and check-ins to suggest targeted program adjustments
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="gap-1.5 shrink-0"
        >
          {isAnalyzing
            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Analyzing...</>
            : <><RefreshCw className="h-3.5 w-3.5" />Run Analysis</>
          }
        </Button>
      </div>

      {/* Error */}
      {analysisError && (
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{analysisError}</p>
        </div>
      )}

      {/* Latest analysis results */}
      {latestOutput && latestDraftId && (
        <div className="space-y-4">
          {/* Analysis summary */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">Analysis Summary</span>
              {latestOutput.data_quality !== "good" && (
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full",
                  latestOutput.data_quality === "limited" ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"
                )}>
                  {latestOutput.data_quality} data
                </span>
              )}
            </div>
            <p className="text-sm text-blue-900">{latestOutput.analysis_summary}</p>
            {latestOutput.data_quality_note && (
              <p className="text-xs text-blue-600 mt-1">{latestOutput.data_quality_note}</p>
            )}
          </div>

          {/* Suggestions */}
          {latestOutput.suggestions.length === 0 ? (
            <div className="flex items-center gap-2.5 text-slate-500 py-4 justify-center">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">No adjustments needed — programming looks on track</span>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                {latestOutput.suggestions.length} suggestion{latestOutput.suggestions.length !== 1 ? "s" : ""}
              </p>
              {latestOutput.suggestions.map((sug, idx) => {
                // Find matching adaptive_suggestion row for this draft + position
                const draftSugs = pendingByDraft.get(latestDraftId) ?? [];
                const sugRow = draftSugs[idx] ?? null;
                return (
                  <SuggestionCard
                    key={idx}
                    sug={sug}
                    sugId={sugRow?.id ?? null}
                    draftId={latestDraftId}
                    sugIndex={idx}
                    clientId={clientId}
                    alreadyReviewed={sugRow?.status !== "pending"}
                    alreadyStatus={sugRow?.status ?? null}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!latestOutput && !isAnalyzing && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Sparkles className="h-8 w-8 text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-600">No analysis yet</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Click &ldquo;Run Analysis&rdquo; to analyze this client&apos;s recent training data and generate targeted suggestions.
          </p>
        </div>
      )}
    </div>
  );
}
