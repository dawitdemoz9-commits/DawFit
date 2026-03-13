"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Dumbbell,
  CheckSquare,
  TrendingUp,
  MessageSquare,
  Calendar,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

const navItems = [
  { href: "/client", label: "Home", icon: LayoutDashboard, exact: true },
  { href: "/client/program", label: "My Program", icon: ClipboardList },
  { href: "/client/log", label: "Log Workout", icon: Dumbbell },
  { href: "/client/check-in", label: "Check-In", icon: CheckSquare },
  { href: "/client/progress", label: "Progress", icon: TrendingUp },
  { href: "/client/messages", label: "Messages", icon: MessageSquare },
  { href: "/client/schedule", label: "Schedule", icon: Calendar },
  { href: "/client/settings", label: "Settings", icon: Settings },
];

interface ClientSidebarProps {
  clientName: string;
  clientAvatar?: string;
  coachName: string;
  coachBusinessName: string;
  brandColor: string;
}

export function ClientSidebar({
  clientName,
  clientAvatar,
  coachBusinessName,
  brandColor,
}: ClientSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-slate-900 flex flex-col">
      {/* Coach brand */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: brandColor }}
          >
            {(coachBusinessName || "D").charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-white font-semibold text-sm truncate">{coachBusinessName}</p>
            <p className="text-slate-400 text-xs">Client Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Profile */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={clientAvatar} />
            <AvatarFallback className="bg-slate-700 text-slate-200 text-xs">
              {getInitials(clientName || "C")}
            </AvatarFallback>
          </Avatar>
          <div className="overflow-hidden flex-1">
            <p className="text-white text-sm font-medium truncate">{clientName}</p>
            <p className="text-slate-400 text-xs">Client</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
