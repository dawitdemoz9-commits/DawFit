import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import { ProgramDraftReview, WorkoutDraftReview } from "@/components/coach/ai-draft-review";
import type { AIProgramDraft, AIWorkoutOnlyDraft } from "@/lib/ai/prompts";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AIDraftReviewPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: draft } = await supabase
    .from("ai_drafts")
    .select("*")
    .eq("id", id)
    .eq("coach_id", user.id)
    .single();

  if (!draft) notFound();

  // If already reviewed, just show status info
  if (draft.status !== "pending") {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/ai" className="text-slate-400 hover:text-slate-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold text-slate-900 capitalize">
            {draft.type.replace(/_/g, " ")} Draft
          </h1>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
          <p className="text-slate-600 font-medium capitalize">This draft has been {draft.status}.</p>
          {draft.approved_resource_id && draft.type === "program" && (
            <Link href={`/dashboard/programs/${draft.approved_resource_id}`} className="text-sm text-blue-600 hover:underline mt-2 block">
              View created program →
            </Link>
          )}
          {draft.approved_resource_id && draft.type === "workout" && (
            <Link href={`/dashboard/workouts/${draft.approved_resource_id}`} className="text-sm text-blue-600 hover:underline mt-2 block">
              View created workout →
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Get client name if attached
  let clientName: string | null = null;
  if (draft.client_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", draft.client_id)
      .single();
    clientName = profile?.full_name ?? null;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/ai" className="text-slate-400 hover:text-slate-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold text-slate-900 capitalize">
          Review {draft.type.replace(/_/g, " ")}
        </h1>
      </div>

      {draft.type === "program" && (
        <ProgramDraftReview
          draftId={id}
          clientName={clientName}
          initialDraft={draft.parsed_content as unknown as AIProgramDraft}
        />
      )}

      {draft.type === "workout" && (
        <WorkoutDraftReview
          draftId={id}
          initialDraft={draft.parsed_content as unknown as AIWorkoutOnlyDraft}
        />
      )}
    </div>
  );
}
