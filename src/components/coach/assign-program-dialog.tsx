"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { assignProgram } from "@/app/dashboard/programs/actions";

interface Client {
  id: string;
  name: string;
}

interface Props {
  programId: string;
  clients: Client[];
}

export function AssignProgramDialog({ programId, clients }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ error?: string; success?: boolean } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const formData = new FormData(e.currentTarget);
    formData.set("program_id", programId);
    const res = await assignProgram(formData);
    setResult(res ?? null);
    setLoading(false);
    if (res?.success) setTimeout(() => setOpen(false), 1000);
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />Assign to Client
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-lg font-semibold">Assign Program</Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon"><X className="h-4 w-4" /></Button>
            </Dialog.Close>
          </div>

          {clients.length === 0 ? (
            <p className="text-slate-500 text-sm py-4 text-center">
              No active clients yet. Invite clients first.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {result?.error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                  {result.error}
                </div>
              )}
              {result?.success && (
                <div className="rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
                  Program assigned successfully!
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="client_id">Client *</Label>
                <select
                  id="client_id"
                  name="client_id"
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select client...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="start_date">Start date *</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Dialog.Close asChild>
                  <Button type="button" variant="outline" className="flex-1">Cancel</Button>
                </Dialog.Close>
                <Button type="submit" className="flex-1" loading={loading}>
                  Assign Program
                </Button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
