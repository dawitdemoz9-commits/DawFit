"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, X } from "lucide-react";
import { resendClientInvite } from "@/app/dashboard/clients/[id]/invite-actions";

interface Props {
  clientId: string;
  email: string;
  confirmed: boolean;
}

export function ResendInviteButton({ clientId, email, confirmed }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleClick() {
    setState("loading");
    try {
      await resendClientInvite(clientId, email);
      setState("done");
      setTimeout(() => setState("idle"), 4000);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 4000);
    }
  }

  if (state === "done") {
    return (
      <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
        <CheckCircle className="h-4 w-4" /> Invite sent to {email}
      </span>
    );
  }

  if (state === "error") {
    return (
      <span className="flex items-center gap-1.5 text-sm text-red-500 font-medium">
        <X className="h-4 w-4" /> Failed — retry
      </span>
    );
  }

  return (
    <Button
      variant={confirmed ? "ghost" : "outline"}
      size="sm"
      onClick={handleClick}
      disabled={state === "loading"}
      title={`Send invite to ${email}`}
      className={confirmed ? "text-slate-400 hover:text-slate-600" : "border-amber-300 text-amber-700 hover:bg-amber-50"}
    >
      <Mail className="h-4 w-4 mr-1.5" />
      {state === "loading" ? "Sending…" : confirmed ? "Resend invite" : "Send invite link"}
    </Button>
  );
}
