import Link from "next/link";
import {
  Dumbbell,
  ClipboardCheck,
  MessageSquare,
  Sparkles,
  UserPlus,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

interface WorkoutLogTask {
  logId: string;
  clientId: string;
  clientName: string;
  loggedAt: string;
}

interface CheckInTask {
  checkInId: string;
  clientId: string;
  clientName: string;
  submittedAt: string;
}

export interface DashboardTasksProps {
  recentWorkoutLogs: WorkoutLogTask[];
  unreviewedCheckIns: CheckInTask[];
  unreadMessageCount: number;
  pendingDraftCount: number;
  newLeads: { id: string; full_name: string | null; email: string }[];
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours === 1) return "1 hour ago";
  return `${hours}h ago`;
}

interface TaskRowProps {
  icon: React.ReactNode;
  label: string;
  sub: string;
  href: string;
  accent: string;
}

function TaskRow({ icon, label, sub, href, accent }: TaskRowProps) {
  return (
    <Link href={href}>
      <div className="flex items-center gap-3.5 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700/50 hover:border-slate-600 hover:bg-slate-750 transition-colors group cursor-pointer">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${accent}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white leading-snug">{label}</p>
          <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
      </div>
    </Link>
  );
}

export function DashboardTasks({
  recentWorkoutLogs,
  unreviewedCheckIns,
  unreadMessageCount,
  pendingDraftCount,
  newLeads,
}: DashboardTasksProps) {
  const tasks: TaskRowProps[] = [];

  // Workout logs completed in the last 24h
  for (const log of recentWorkoutLogs) {
    tasks.push({
      icon: <Dumbbell className="h-4 w-4 text-indigo-400" />,
      label: `Review ${log.clientName}'s workout log`,
      sub: `Completed ${relativeTime(log.loggedAt)} · check sets and notes`,
      href: `/dashboard/clients/${log.clientId}`,
      accent: "bg-indigo-500/10",
    });
  }

  // Unreviewed check-ins
  for (const ci of unreviewedCheckIns) {
    tasks.push({
      icon: <ClipboardCheck className="h-4 w-4 text-violet-400" />,
      label: `Review ${ci.clientName}'s check-in`,
      sub: `Submitted ${relativeTime(ci.submittedAt)} · add coach notes`,
      href: `/dashboard/clients/${ci.clientId}`,
      accent: "bg-violet-500/10",
    });
  }

  // Unread messages
  if (unreadMessageCount > 0) {
    tasks.push({
      icon: <MessageSquare className="h-4 w-4 text-emerald-400" />,
      label: unreadMessageCount === 1
        ? "Reply to 1 unread message"
        : `Reply to ${unreadMessageCount} unread messages`,
      sub: "Your clients are waiting for a response",
      href: "/dashboard/messages",
      accent: "bg-emerald-500/10",
    });
  }

  // Pending AI drafts
  if (pendingDraftCount > 0) {
    tasks.push({
      icon: <Sparkles className="h-4 w-4 text-amber-400" />,
      label: pendingDraftCount === 1
        ? "Approve 1 AI program suggestion"
        : `Approve ${pendingDraftCount} AI suggestions`,
      sub: "Review AI-generated adjustments before they're applied",
      href: "/dashboard/ai",
      accent: "bg-amber-500/10",
    });
  }

  // New leads
  for (const lead of newLeads.slice(0, 3)) {
    tasks.push({
      icon: <UserPlus className="h-4 w-4 text-blue-400" />,
      label: `Follow up with ${lead.full_name ?? lead.email}`,
      sub: "New lead — move to contacted after reaching out",
      href: `/dashboard/leads/${lead.id}`,
      accent: "bg-blue-500/10",
    });
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl bg-slate-800 border border-slate-700/50 px-5 py-6 flex items-center gap-4">
        <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">You&apos;re all caught up today.</p>
          <p className="text-xs text-slate-500 mt-0.5">No pending reviews, messages, or follow-ups right now.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200/60 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-700/60 flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Today&apos;s Tasks</p>
        <span className="text-xs text-slate-500 bg-slate-800 border border-slate-700 rounded-full px-2 py-0.5">
          {tasks.length} action{tasks.length !== 1 ? "s" : ""}
        </span>
      </div>
      {/* Task list */}
      <div className="bg-slate-900 p-3 space-y-2">
        {tasks.map((task, i) => (
          <TaskRow key={i} {...task} />
        ))}
      </div>
    </div>
  );
}
