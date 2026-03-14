"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  CalendarIcon,
  CheckIcon,
  XIcon,
  LinkIcon,
  SettingsIcon,
  ClockIcon,
} from "lucide-react";
import {
  confirmBooking,
  cancelBooking,
  completeBooking,
  saveMeetingUrl,
  saveAvailability,
} from "@/app/dashboard/schedule/actions";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Booking {
  id: string;
  client_id: string;
  client_name: string;
  scheduled_at: string;
  duration_min: number;
  type: string | null;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes: string | null;
  meeting_url: string | null;
}

interface AvailabilitySlot {
  id: string;
  day_of_week: number[] | null;
  start_time: string;
  end_time: string;
  slot_duration_min: number;
  is_active: boolean;
}

interface ScheduleCoachProps {
  bookings: Booking[];
  availability: AvailabilitySlot | null;
}

function formatBookingTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function BookingCard({ booking, onRefresh }: { booking: Booking; onRefresh: () => void }) {
  const [pending, setPending] = useState<string | null>(null);
  const [editingUrl, setEditingUrl] = useState(false);
  const [urlValue, setUrlValue] = useState(booking.meeting_url ?? "");

  async function act(action: () => Promise<void>, key: string) {
    setPending(key);
    await action();
    setPending(null);
    onRefresh();
  }

  async function handleSaveUrl() {
    setPending("url");
    await saveMeetingUrl(booking.id, urlValue);
    setPending(null);
    setEditingUrl(false);
    onRefresh();
  }

  return (
    <Card className={booking.status === "pending" ? "border-amber-200 bg-amber-50/30" : ""}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-medium text-slate-900 text-sm">{booking.client_name}</p>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <ClockIcon className="w-3 h-3" />
              {formatBookingTime(booking.scheduled_at)} · {booking.duration_min} min
            </p>
            {booking.type && (
              <p className="text-xs text-slate-400 mt-0.5 capitalize">{booking.type.replace(/_/g, " ")}</p>
            )}
          </div>
          <Badge
            className={booking.status === "pending"
              ? "bg-amber-100 text-amber-700"
              : "bg-green-100 text-green-700"}
          >
            {booking.status}
          </Badge>
        </div>

        {booking.notes && (
          <p className="text-xs text-slate-500 italic border-l-2 border-slate-200 pl-2">{booking.notes}</p>
        )}

        {/* Meeting URL */}
        {editingUrl ? (
          <div className="flex gap-2">
            <Input
              value={urlValue}
              onChange={e => setUrlValue(e.target.value)}
              placeholder="https://meet.google.com/..."
              className="text-xs h-8 flex-1"
            />
            <Button size="sm" className="h-8 px-2" disabled={pending === "url"} onClick={handleSaveUrl}>
              {pending === "url" ? "…" : <CheckIcon className="w-3.5 h-3.5" />}
            </Button>
            <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => setEditingUrl(false)}>
              <XIcon className="w-3.5 h-3.5" />
            </Button>
          </div>
        ) : booking.meeting_url ? (
          <a
            href={booking.meeting_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
          >
            <LinkIcon className="w-3 h-3" />
            {booking.meeting_url}
          </a>
        ) : booking.status === "confirmed" ? (
          <button
            onClick={() => setEditingUrl(true)}
            className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors"
          >
            <LinkIcon className="w-3 h-3" />
            Add meeting link
          </button>
        ) : null}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          {booking.status === "pending" && (
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white h-7 text-xs"
              disabled={!!pending}
              onClick={() => act(() => confirmBooking(booking.id), "confirm")}
            >
              {pending === "confirm" ? "…" : <><CheckIcon className="w-3.5 h-3.5 mr-1" />Confirm</>}
            </Button>
          )}
          {booking.status === "confirmed" && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs border-green-300 text-green-700 hover:bg-green-50"
              disabled={!!pending}
              onClick={() => act(() => completeBooking(booking.id), "complete")}
            >
              {pending === "complete" ? "…" : "Mark Complete"}
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-slate-400 hover:text-red-500 ml-auto"
            disabled={!!pending}
            onClick={() => act(() => cancelBooking(booking.id), "cancel")}
          >
            {pending === "cancel" ? "…" : "Cancel"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AvailabilityEditor({ current }: { current: AvailabilitySlot | null }) {
  const router = useRouter();
  const [selectedDays, setSelectedDays] = useState<number[]>(current?.day_of_week ?? [1, 2, 3, 4, 5]);
  const [startTime, setStartTime] = useState(current?.start_time ?? "09:00");
  const [endTime, setEndTime] = useState(current?.end_time ?? "17:00");
  const [duration, setDuration] = useState(current?.slot_duration_min ?? 60);
  const [saving, setSaving] = useState(false);

  function toggleDay(day: number) {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  }

  async function handleSave() {
    setSaving(true);
    await saveAvailability({ days: selectedDays, start_time: startTime, end_time: endTime, slot_duration_min: duration });
    setSaving(false);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <SettingsIcon className="w-4 h-4 text-slate-400" />
          Availability
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs text-slate-500 mb-2">Available days</p>
          <div className="flex gap-1.5 flex-wrap">
            {DAYS.map((day, i) => (
              <button
                key={day}
                onClick={() => toggleDay(i)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  selectedDays.includes(i)
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Start time</label>
            <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="h-8 text-sm" />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">End time</label>
            <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="h-8 text-sm" />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-500 block mb-1">Session length</label>
          <select
            value={duration}
            onChange={e => setDuration(Number(e.target.value))}
            className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>60 minutes</option>
            <option value={90}>90 minutes</option>
          </select>
        </div>

        <Button
          size="sm"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? "Saving…" : "Save Availability"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function ScheduleCoach({ bookings, availability }: ScheduleCoachProps) {
  const router = useRouter();
  const pending = bookings.filter(b => b.status === "pending");
  const confirmed = bookings.filter(b => b.status === "confirmed");

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Schedule</h1>
        <p className="text-slate-500 text-sm">
          {pending.length > 0 ? `${pending.length} pending request${pending.length > 1 ? "s" : ""}` : "No pending requests"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookings */}
        <div className="lg:col-span-2 space-y-4">
          {pending.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-700 mb-2">
                Pending Requests <span className="text-amber-600">({pending.length})</span>
              </h2>
              <div className="space-y-3">
                {pending.map(b => (
                  <BookingCard key={b.id} booking={b} onRefresh={() => router.refresh()} />
                ))}
              </div>
            </div>
          )}

          {confirmed.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-700 mb-2">Confirmed ({confirmed.length})</h2>
              <div className="space-y-3">
                {confirmed.map(b => (
                  <BookingCard key={b.id} booking={b} onRefresh={() => router.refresh()} />
                ))}
              </div>
            </div>
          )}

          {bookings.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
              <CalendarIcon className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm">No upcoming sessions.</p>
              <p className="text-xs mt-1">Set your availability so clients can request sessions.</p>
            </div>
          )}
        </div>

        {/* Availability */}
        <div>
          <AvailabilityEditor current={availability} />
        </div>
      </div>
    </div>
  );
}
