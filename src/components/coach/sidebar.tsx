"use client";

import { useState } from "react";
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
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { signOut } from "@/app/auth/actions";

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

function SidebarContent({
  coachName,
  coachAvatar,
  businessName,
  brandColor,
  onNavClick,
}: SidebarProps & { onNavClick?: () => void }) {
  const pathname = usePathname();

  return (
    <>
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
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavClick}
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
          <form action={signOut}>
            <button
              type="submit"
              className="text-slate-400 hover:text-white transition-colors p-1 rounded"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export function CoachSidebar(props: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 min-h-screen bg-slate-900 flex-col flex-shrink-0">
        <SidebarContent {...props} />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className="h-7 w-7 rounded-md flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
            style={{ backgroundColor: props.brandColor }}
          >
            {getInitials(props.businessName || "D")}
          </div>
          <span className="text-white font-semibold text-sm">{props.businessName || "DawFit"}</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-slate-400 hover:text-white p-1"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "md:hidden fixed top-0 left-0 h-full w-64 bg-slate-900 flex flex-col z-50 transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-end p-3 border-b border-slate-800">
          <button
            onClick={() => setMobileOpen(false)}
            className="text-slate-400 hover:text-white p-1"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-col flex-1 overflow-hidden">
          <SidebarContent {...props} onNavClick={() => setMobileOpen(false)} />
        </div>
      </aside>
    </>
  );
}
