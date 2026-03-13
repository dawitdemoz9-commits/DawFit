"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserPlus, ChevronRight, X, CheckCheck } from "lucide-react";
import { updateLeadStatus, convertLeadToClient } from "@/app/dashboard/leads/[id]/actions";

type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "rejected";

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  converted: "Converted",
  rejected: "Rejected",
};

interface LeadActionsProps {
  leadId: string;
  status: LeadStatus;
  nextStatus: LeadStatus | undefined;
  convertedClientId: string | null;
}

export function LeadActions({ leadId, status, nextStatus, convertedClientId }: LeadActionsProps) {
  const [pending, setPending] = useState<string | null>(null);
  const [confirmConvert, setConfirmConvert] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStatusUpdate(newStatus: LeadStatus) {
    setPending(newStatus);
    setError(null);
    try {
      await updateLeadStatus(leadId, newStatus);
    } catch {
      setError("Failed to update status. Try again.");
    } finally {
      setPending(null);
    }
  }

  async function handleConvert() {
    setPending("convert");
    setError(null);
    try {
      await convertLeadToClient(leadId);
      // redirect happens server-side — no cleanup needed
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed. Try again.");
      setPending(null);
      setConfirmConvert(false);
    }
  }

  // Already converted
  if (status === "converted") {
    return (
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
        <CheckCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-800">Lead converted to client</p>
        </div>
        {convertedClientId && (
          <Button size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-100" asChild>
            <Link href={`/dashboard/clients/${convertedClientId}`}>View Client</Link>
          </Button>
        )}
      </div>
    );
  }

  // Rejected
  if (status === "rejected") {
    return (
      <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <p className="text-sm text-slate-500 flex-1">This lead has been rejected.</p>
        <Button
          size="sm"
          variant="outline"
          disabled={!!pending}
          onClick={() => handleStatusUpdate("new")}
        >
          {pending === "new" ? "…" : "Reopen"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {/* Move to next status */}
        {nextStatus && (
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            disabled={!!pending}
            onClick={() => handleStatusUpdate(nextStatus)}
          >
            {pending === nextStatus ? "Saving…" : (
              <>
                Mark as {STATUS_LABELS[nextStatus]}
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        )}

        {/* Convert to client (available once qualified or earlier) */}
        {!confirmConvert ? (
          <Button
            variant="outline"
            className="border-green-300 text-green-700 hover:bg-green-50"
            disabled={!!pending}
            onClick={() => setConfirmConvert(true)}
          >
            <UserPlus className="w-4 h-4 mr-1.5" />
            Convert to Client
          </Button>
        ) : (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl w-full">
            <p className="text-sm text-green-800 flex-1">
              This will invite the lead by email and create their client profile.
            </p>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white flex-shrink-0"
              disabled={pending === "convert"}
              onClick={handleConvert}
            >
              {pending === "convert" ? "Converting…" : "Confirm"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="flex-shrink-0"
              disabled={pending === "convert"}
              onClick={() => setConfirmConvert(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Reject */}
        <Button
          variant="ghost"
          className="text-slate-400 hover:text-red-500 hover:bg-red-50 ml-auto"
          disabled={!!pending}
          onClick={() => handleStatusUpdate("rejected")}
        >
          {pending === "rejected" ? "…" : "Reject"}
        </Button>
      </div>
    </div>
  );
}
