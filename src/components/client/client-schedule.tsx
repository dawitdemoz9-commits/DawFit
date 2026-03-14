"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, ClockIcon, LinkIcon, PlusIcon, XIcon } from "lucide-react";
import { requestBooking, cancelClientBooking } from "@/app/client/schedule/actions";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Booking {
  id: string;
  scheduled_at: string;
  duration_min: number;
  type: string | null;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes: string | null;
  meeting_url: string | null;
}

interface Availability {
  day_of_week: number[] | null;
  start_time: string;
  end_time: string;
  slot_duration_min: number;
}

interface ClientScheduleProps {
  bookings: Booking[];
  availability: Availability | null;
}

const SESSION_TYPES = [
  { value: "coaching", label: "Coaching Call" },
  { value: "1on1_workout", label: "1-on-1 Workout" },
  { value: "program_review", label: "Program Review" },
  { value: "other", label: "Other" },
];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-green-100 text-green-700",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ClientSchedule({ bookings, availability }: ClientScheduleProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState(availability?.start_time ?? "09:00");
  const [type, setType] = useState("coaching");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const availableDays = availability?.day_of_week ?? null;
  const dayNames = availableDays
    ? availableDays.map(d => DAYS[d]).join(", ")
    : null;

  async function handleRequest() {
    if (!date || !time) return;
    setSubmitting(true);
    setError(null);

    const scheduledAt = new Date(`${date}T${time}:00`).toISOString();

    try {
      await requestBooking({ scheduled_at: scheduledAt, type, notes: notes || undefined });
      setShowForm(false);
      setDate("");
      setNotes("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to request session");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(id: string) {
    setCancelling(id);
    await cancelClientBooking(id);
    setCancelling(null);
    router.refresh();
  }

  return (
    <div className="p-6 space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Schedule</h1>
          <p className="text-slate-500 text-sm">Request and manage sessions with your coach</p>
        </div>
        {!showForm && (
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => setShowForm(true)}
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            Request Session
          </Button>
        )}
      </div>

      {/* Coach availability hint */}
      {availability && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-500 flex items-center gap-2">
          <ClockIcon className="w-3.5 h-3.5 flex-shrink-0" />
          Coach available {dayNames} · {availability.start_time}–{availability.end_time} · {availability.slot_duration_min} min sessions
        </div>
      )}

      {/* Request form */}
      {showForm && (
        <Card className="border-indigo-200 bg-indigo-50/30">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-900">Request a Session</p>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="flex h-8 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="flex h-8 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-500 block mb-1">Session type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="flex h-8 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {SESSION_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-500 block mb-1">Notes (optional)</label>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="What would you like to discuss?"
                rows={2}
                className="text-sm resize-none"
              />
            </div>

            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              size="sm"
              disabled={!date || !time || submitting}
              onClick={handleRequest}
            >
              {submitting ? "Requesting…" : "Submit Request"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Bookings list */}
      {bookings.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
          <CalendarIcon className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm">No upcoming sessions.</p>
          <p className="text-xs mt-1">Request a session with your coach above.</p>
        </div>
      )}

      <div className="space-y-3">
        {bookings.map(b => (
          <Card key={b.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-900">
                    {(b.type ?? "coaching").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" />
                    {formatTime(b.scheduled_at)} · {b.duration_min} min
                  </p>
                  {b.meeting_url && b.status === "confirmed" && (
                    <a
                      href={b.meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      <LinkIcon className="w-3 h-3" />
                      Join session
                    </a>
                  )}
                  {b.notes && (
                    <p className="text-xs text-slate-400 italic">{b.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge className={STATUS_STYLES[b.status] ?? "bg-slate-100 text-slate-500"}>
                    {b.status}
                  </Badge>
                  {b.status === "pending" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-slate-400 hover:text-red-500 hover:bg-red-50"
                      disabled={cancelling === b.id}
                      onClick={() => handleCancel(b.id)}
                    >
                      {cancelling === b.id ? "…" : "Cancel"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
