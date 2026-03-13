"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Dumbbell,
  ClipboardList,
  Zap,
  MessageSquare,
  Calendar,
  BarChart3,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/leads", label: "Leads", icon: UserPlus },
  { href: "/dashboard/programs", label: "Programs", icon: ClipboardList },
  { href: "/dashboard/workouts", label: "Workouts", icon: Dumbbell },
  { href: "/dashboard/exercises", label: "Exercises", icon: Zap },
  { href: "/dashboard/ai", label: "AI Drafts", icon: Sparkles },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/schedule", label: "Schedule", icon: Calendar },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  coachName: string;
  coachAvatar?: string;
  businessName: string;
  brandColor: string;
}

export function CoachSidebar({ coachName, coachAvatar, businessName, brandColor }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-slate-900 flex flex-col">
      {/* Brand */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: brandColor }}
          >
            {getInitials(businessName || "D")}
          </div>
          <div className="overflow-hidden">
            <p className="text-white font-semibold text-sm truncate">{businessName || "DawFit"}</p>
            <p className="text-slate-400 text-xs">Coach Portal</p>
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
            <AvatarImage src={coachAvatar} />
            <AvatarFallback className="bg-slate-700 text-slate-200 text-xs">
              {getInitials(coachName || "C")}
            </AvatarFallback>
          </Avatar>
          <div className="overflow-hidden flex-1">
            <p className="text-white text-sm font-medium truncate">{coachName}</p>
            <p className="text-slate-400 text-xs">Coach</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
