"use client";

import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";

interface Notification {
  id: string;
  type: "new_lead" | "new_checkin";
  message: string;
  href: string;
  created_at: string;
  read: boolean;
}

interface Props {
  coachId: string;
  initialUnreadLeads: number;
  initialUnreadCheckIns: number;
}

export function NotificationBell({ coachId, initialUnreadLeads, initialUnreadCheckIns }: Props) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(initialUnreadLeads + initialUnreadCheckIns);
  const ref = useRef<HTMLDivElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Realtime: new leads
  useEffect(() => {
    const channel = supabase
      .channel(`coach-notifications-${coachId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "leads",
          filter: `coach_id=eq.${coachId}`,
        },
        (payload) => {
          const lead = payload.new as { id: string; full_name?: string; email: string };
          const name = lead.full_name ?? lead.email;
          const notification: Notification = {
            id: `lead-${lead.id}`,
            type: "new_lead",
            message: `New lead: ${name}`,
            href: `/dashboard/leads/${lead.id}`,
            created_at: new Date().toISOString(),
            read: false,
          };
          setNotifications((prev) => [notification, ...prev].slice(0, 20));
          setUnread((n) => n + 1);
          toast.info(`New lead: ${name}`, {
            description: "Someone applied through your coaching page.",
            action: { label: "View", onClick: () => window.location.href = notification.href },
          });
          // Browser push (if permission granted)
          if (typeof window !== "undefined" && Notification.permission === "granted") {
            new Notification("New Lead — DawFit", {
              body: `${name} applied through your coaching page.`,
              icon: "/favicon.ico",
            });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "check_ins",
          filter: `coach_id=eq.${coachId}`,
        },
        (payload) => {
          const ci = payload.new as { id: string; client_id: string };
          const notification: Notification = {
            id: `checkin-${ci.id}`,
            type: "new_checkin",
            message: "New check-in submitted",
            href: `/dashboard/clients/${ci.client_id}?tab=checkins`,
            created_at: new Date().toISOString(),
            read: false,
          };
          setNotifications((prev) => [notification, ...prev].slice(0, 20));
          setUnread((n) => n + 1);
          toast.info("New check-in submitted", {
            description: "A client submitted their weekly check-in.",
            action: { label: "Review", onClick: () => window.location.href = notification.href },
          });
          if (typeof window !== "undefined" && Notification.permission === "granted") {
            new Notification("New Check-in — DawFit", {
              body: "A client submitted their weekly check-in.",
              icon: "/favicon.ico",
            });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [coachId]);

  // Request browser push permission once
  useEffect(() => {
    if (typeof window !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen((o) => !o); if (!open) markAllRead(); }}
        className="relative p-1.5 text-slate-400 hover:text-white transition-colors rounded-md hover:bg-slate-800"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
            <p className="text-white text-sm font-semibold">Notifications</p>
            {notifications.length > 0 && (
              <button onClick={markAllRead} className="text-xs text-slate-400 hover:text-white">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="h-6 w-6 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No notifications yet</p>
                <p className="text-slate-600 text-xs mt-1">New leads and check-ins will appear here</p>
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-slate-700/50 transition-colors border-b border-slate-700/50 last:border-0"
                >
                  <div className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${n.read ? "bg-slate-600" : "bg-indigo-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 text-sm leading-snug">{n.message}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{formatRelativeTime(n.created_at)}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
