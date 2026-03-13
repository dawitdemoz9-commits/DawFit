"use client";

import { useState, useTransition } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";

interface Props {
  clientId: string;
  currentStatus: "active" | "inactive" | "paused";
}

const STATUS_OPTIONS = [
  { value: "active", label: "Set Active" },
  { value: "paused", label: "Pause Client" },
  { value: "inactive", label: "Deactivate" },
] as const;

export function ClientStatusActions({ clientId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleStatusChange(status: "active" | "inactive" | "paused") {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.from("clients").update({ status }).eq("id", clientId);
      router.refresh();
    });
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="outline" size="sm" disabled={isPending}>
          Actions <ChevronDown className="h-3.5 w-3.5 ml-1.5" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[140px] bg-white rounded-lg border shadow-md py-1 text-sm"
          align="end"
          sideOffset={4}
        >
          {STATUS_OPTIONS.filter(o => o.value !== currentStatus).map(o => (
            <DropdownMenu.Item
              key={o.value}
              className="px-3 py-2 cursor-pointer hover:bg-slate-50 outline-none text-slate-700"
              onSelect={() => handleStatusChange(o.value)}
            >
              {o.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
