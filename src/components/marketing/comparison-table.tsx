import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckIcon, XIcon, MinusIcon, ArrowRight } from "lucide-react";

export type FeatureValue = boolean | "partial" | string;

export interface ComparisonRow {
  feature: string;
  dawfit: FeatureValue;
  competitor: FeatureValue;
}

interface ComparisonTableProps {
  competitor: string;
  rows: ComparisonRow[];
}

function FeatureCell({ value }: { value: FeatureValue }) {
  if (value === true) {
    return (
      <div className="flex justify-center">
        <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckIcon className="h-3.5 w-3.5 text-green-400" />
        </div>
      </div>
    );
  }
  if (value === false) {
    return (
      <div className="flex justify-center">
        <div className="h-6 w-6 rounded-full bg-slate-700 flex items-center justify-center">
          <XIcon className="h-3.5 w-3.5 text-slate-500" />
        </div>
      </div>
    );
  }
  if (value === "partial") {
    return (
      <div className="flex justify-center">
        <div className="h-6 w-6 rounded-full bg-amber-500/20 flex items-center justify-center">
          <MinusIcon className="h-3.5 w-3.5 text-amber-400" />
        </div>
      </div>
    );
  }
  // String value
  return <p className="text-center text-slate-300 text-sm">{value}</p>;
}

export function ComparisonTable({ competitor, rows }: ComparisonTableProps) {
  return (
    <div className="rounded-2xl border border-slate-700/60 overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-3 bg-slate-800/80 border-b border-slate-700/60">
        <div className="px-6 py-4">
          <p className="text-slate-400 text-sm font-medium">Feature</p>
        </div>
        <div className="px-6 py-4 text-center border-l border-slate-700/60">
          <div className="flex items-center justify-center gap-2">
            <div className="h-6 w-6 rounded bg-indigo-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs">D</span>
            </div>
            <span className="text-white font-semibold text-sm">DawFit</span>
          </div>
        </div>
        <div className="px-6 py-4 text-center border-l border-slate-700/60">
          <p className="text-slate-400 font-medium text-sm">{competitor}</p>
        </div>
      </div>

      {/* Rows */}
      {rows.map((row, i) => (
        <div
          key={row.feature}
          className={`grid grid-cols-3 border-b border-slate-700/40 last:border-0 ${
            i % 2 === 0 ? "bg-slate-800/20" : "bg-slate-800/40"
          }`}
        >
          <div className="px-6 py-4">
            <p className="text-slate-200 text-sm font-medium">{row.feature}</p>
          </div>
          <div className="px-6 py-4 border-l border-slate-700/40">
            <FeatureCell value={row.dawfit} />
          </div>
          <div className="px-6 py-4 border-l border-slate-700/40">
            <FeatureCell value={row.competitor} />
          </div>
        </div>
      ))}

      {/* CTA row */}
      <div className="grid grid-cols-3 bg-slate-800/60 border-t border-slate-700/60">
        <div className="px-6 py-5" />
        <div className="px-6 py-5 border-l border-slate-700/60 flex justify-center">
          <Button asChild size="sm" className="bg-indigo-500 hover:bg-indigo-600">
            <Link href="/auth/signup">
              Start Free <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </div>
        <div className="px-6 py-5 border-l border-slate-700/60 flex items-center justify-center">
          <p className="text-slate-500 text-xs">Separate pricing</p>
        </div>
      </div>
    </div>
  );
}
