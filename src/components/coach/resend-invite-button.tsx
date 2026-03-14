"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle } from "lucide-react";
import { resendClientInvite } from "@/app/dashboard/clients/[id]/invite-actions";

interface Props {
  clientId: string;
  email: string;
}

export function ResendInviteButton({ clientId, email }: Props) {
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
        <CheckCircle className="h-4 w-4" /> Invite sent
      </span>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={state === "loading"}
      title={`Resend invite to ${email}`}
    >
      <Mail className="h-4 w-4 mr-1.5" />
      {state === "loading" ? "Sending…" : state === "error" ? "Failed — retry" : "Resend invite"}
    </Button>
  );
}
