"use client";

import { useState, useTransition } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, X } from "lucide-react";
import { reviewCheckIn } from "@/app/client/check-in/actions";
import { useRouter } from "next/navigation";

interface Props {
  checkInId: string;
  existingNotes?: string | null;
}

export function ReviewCheckInDialog({ checkInId, existingNotes }: Props) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(existingNotes ?? "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit() {
    startTransition(async () => {
      await reviewCheckIn(checkInId, notes);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="outline" size="sm">
          <MessageSquarePlus className="h-3.5 w-3.5 mr-1.5" />
          {existingNotes ? "Edit notes" : "Add notes"}
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-xl p-6 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-base font-semibold text-slate-900">Review Check-In</Dialog.Title>
            <Dialog.Close className="text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Coach notes <span className="font-normal text-slate-400">(visible to you only)</span>
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add feedback, observations, or action items..."
                rows={4}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Dialog.Close asChild>
                <Button variant="outline" disabled={isPending}>Cancel</Button>
              </Dialog.Close>
              <Button onClick={handleSubmit} disabled={isPending}>
                {isPending ? "Saving..." : "Mark Reviewed"}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
