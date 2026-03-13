"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { inviteClient } from "@/app/auth/actions";

interface InviteClientDialogProps {
  trigger?: React.ReactNode;
}

export function InviteClientDialog({ trigger }: InviteClientDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ error?: string; success?: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const formData = new FormData(e.currentTarget);
    const res = await inviteClient(formData);
    setResult(res ?? null);
    setLoading(false);
    if (res?.success) {
      setTimeout(() => setOpen(false), 1500);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {trigger ?? (
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Client
          </Button>
        )}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-lg font-semibold">Invite a Client</Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {result?.error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                {result.error}
              </div>
            )}
            {result?.success && (
              <div className="rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
                {result.success}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="invite_full_name">Full name</Label>
              <Input id="invite_full_name" name="full_name" placeholder="Client name" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invite_email">Email address</Label>
              <Input id="invite_email" name="email" type="email" placeholder="client@example.com" required />
            </div>
            <div className="flex gap-2 pt-2">
              <Dialog.Close asChild>
                <Button type="button" variant="outline" className="flex-1">Cancel</Button>
              </Dialog.Close>
              <Button type="submit" className="flex-1" loading={loading}>
                Send invitation
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
