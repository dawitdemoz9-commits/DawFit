"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Dumbbell, Clock, Flame } from "lucide-react";

interface WeightPoint {
  date: string;
  weight: number;
  unit: string;
}

interface WellnessPoint {
  date: string;
  sleep: number | null;
  stress: number | null;
  soreness: number | null;
}

interface SessionPoint {
  week: string;
  sessions: number;
}

interface RecentWorkout {
  id: string;
  title: string;
  logged_at: string;
  duration_min: number | null;
  overall_rpe: number | null;
}

interface Props {
  weightData: WeightPoint[];
  wellnessData: WellnessPoint[];
  weeklySessionData: SessionPoint[];
  recentWorkouts?: RecentWorkout[];
  totalSessions30d?: number;
  avgRpe?: number | null;
  weightChange?: number | null;
  weightUnit?: string;
}

const CHART_BG = {
  background: "#1e293b",
  border: "1px solid #334155",
  borderRadius: 12,
  padding: 16,
};

const TOOLTIP_STYLE = {
  contentStyle: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: 8,
    fontSize: 12,
    color: "#e2e8f0",
  },
  labelStyle: { fontWeight: 600, color: "#94a3b8" },
};

function formatDate(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="h-40 flex items-center justify-center rounded-xl bg-slate-800/60 border border-slate-700 border-dashed">
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

export function ProgressCharts({
  weightData,
  wellnessData,
  weeklySessionData,
  recentWorkouts,
  totalSessions30d,
  avgRpe,
  weightChange,
  weightUnit = "lbs",
}: Props) {
  const formattedWeight = weightData.map(d => ({ ...d, date: formatDate(d.date) }));
  const formattedWellness = wellnessData.map(d => ({ ...d, date: formatDate(d.date) }));
  const formattedSessions = weeklySessionData.map(d => ({ ...d, week: formatDate(d.week) }));

  return (
    <div className="space-y-8">
      {/* Stats snapshot */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{totalSessions30d ?? 0}</p>
          <p className="text-xs text-slate-500 mt-1">Sessions (30d)</p>
        </div>
        <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">
            {weightChange != null
              ? `${weightChange > 0 ? "+" : ""}${weightChange}`
              : "—"}
          </p>
          <p className="text-xs text-slate-500 mt-1">Weight ({weightUnit})</p>
        </div>
        <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">
            {avgRpe != null ? avgRpe.toFixed(1) : "—"}
          </p>
          <p className="text-xs text-slate-500 mt-1">Avg RPE</p>
        </div>
      </div>

      {/* Last 5 Sessions */}
      {recentWorkouts && recentWorkouts.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-white mb-3">Last 5 Sessions</h2>
          <div className="space-y-2">
            {recentWorkouts.map((w) => (
              <div
                key={w.id}
                className="bg-slate-800 border border-slate-700/50 rounded-xl px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                    <Dumbbell className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{w.title}</p>
                    <p className="text-xs text-slate-500">{formatRelative(w.logged_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  {w.duration_min && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />{w.duration_min}m
                    </span>
                  )}
                  {w.overall_rpe && (
                    <span className="flex items-center gap-1 text-amber-400">
                      <Flame className="h-3 w-3" />RPE {w.overall_rpe}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Weekly sessions bar */}
      <section>
        <h2 className="text-base font-semibold text-white mb-4">Workouts per Week</h2>
        {formattedSessions.length < 2 ? (
          <EmptyState message="Log more workouts to see your weekly frequency chart" />
        ) : (
          <div style={CHART_BG}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={formattedSessions} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="sessions" fill="#6366f1" radius={[4, 4, 0, 0]} name="Sessions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Weight over time */}
      <section>
        <h2 className="text-base font-semibold text-white mb-4">Body Weight</h2>
        {formattedWeight.length < 2 ? (
          <EmptyState message="Submit at least 2 check-ins with your weight to see this chart" />
        ) : (
          <div style={CHART_BG}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={formattedWeight} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} domain={["auto", "auto"]} />
                <Tooltip
                  {...TOOLTIP_STYLE}
                  formatter={(value) => [`${value} ${formattedWeight[0]?.unit ?? "lbs"}`]}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ fill: "#6366f1", r: 4 }}
                  activeDot={{ r: 5 }}
                  name="Weight"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Wellness trends */}
      <section>
        <h2 className="text-base font-semibold text-white mb-4">Wellness Trends</h2>
        {formattedWellness.filter(d => d.sleep || d.stress || d.soreness).length < 2 ? (
          <EmptyState message="Submit at least 2 weekly check-ins to see wellness trends" />
        ) : (
          <div style={CHART_BG}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={formattedWellness} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
                <Line
                  type="monotone"
                  dataKey="sleep"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Sleep"
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="stress"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Stress"
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="soreness"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Soreness"
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-slate-500 text-center mt-2">Scale 1–5 · Lower stress is better · Higher sleep is better</p>
          </div>
        )}
      </section>
    </div>
  );
}
