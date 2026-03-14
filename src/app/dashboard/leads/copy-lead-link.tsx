"use client";

import { CopyIcon } from "lucide-react";

export function CopyLeadLink({ url }: { url: string }) {
  return (
    <button
      type="button"
      className="text-slate-400 hover:text-slate-600 flex-shrink-0"
      onClick={() => navigator.clipboard.writeText(url)}
      title="Copy link"
    >
      <CopyIcon className="w-3.5 h-3.5" />
    </button>
  );
}
