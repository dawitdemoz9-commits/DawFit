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

interface Props {
  weightData: WeightPoint[];
  wellnessData: WellnessPoint[];
  weeklySessionData: SessionPoint[];
}

function formatDate(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="h-40 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 border-dashed">
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}

export function ProgressCharts({ weightData, wellnessData, weeklySessionData }: Props) {
  const formattedWeight = weightData.map(d => ({ ...d, date: formatDate(d.date) }));
  const formattedWellness = wellnessData.map(d => ({ ...d, date: formatDate(d.date) }));
  const formattedSessions = weeklySessionData.map(d => ({ ...d, week: formatDate(d.week) }));

  return (
    <div className="space-y-8">
      {/* Weekly sessions bar */}
      <section>
        <h2 className="text-base font-semibold text-slate-900 mb-4">Workouts per Week</h2>
        {formattedSessions.length < 2 ? (
          <EmptyState message="Log more workouts to see your weekly frequency chart" />
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={formattedSessions} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Bar dataKey="sessions" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Sessions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Weight over time */}
      <section>
        <h2 className="text-base font-semibold text-slate-900 mb-4">Body Weight</h2>
        {formattedWeight.length < 2 ? (
          <EmptyState message="Submit at least 2 check-ins with your weight to see this chart" />
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={formattedWeight} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                  labelStyle={{ fontWeight: 600 }}
                  formatter={(value) => [`${value} ${formattedWeight[0]?.unit ?? "lbs"}`]}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 4 }}
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
        <h2 className="text-base font-semibold text-slate-900 mb-4">Wellness Trends</h2>
        {formattedWellness.filter(d => d.sleep || d.stress || d.soreness).length < 2 ? (
          <EmptyState message="Submit at least 2 weekly check-ins to see wellness trends" />
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={formattedWellness} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
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
            <p className="text-xs text-slate-400 text-center mt-2">Scale 1–5 · Lower stress is better · Higher sleep is better</p>
          </div>
        )}
      </section>
    </div>
  );
}
