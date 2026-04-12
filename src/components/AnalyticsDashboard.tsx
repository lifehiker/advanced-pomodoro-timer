"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, Target, Flame, Zap, Calendar } from "lucide-react";
import { usePomodoroStore } from "@/lib/store";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid,
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";

const COLORS = ["#f59e0b", "#10b981", "#6366f1", "#ec4899", "#8b5cf6", "#14b8a6", "#f97316"];

export default function AnalyticsDashboard() {
  const { sessions, totalXP, currentStreak, completedSessions } = usePomodoroStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const workSessions = useMemo(() => sessions.filter((s) => s.type === "work"), [sessions]);

  const totalFocusHours = useMemo(
    () => workSessions.reduce((sum, s) => sum + s.duration, 0) / 60,
    [workSessions]
  );

  const dailyData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(startOfDay(date), "yyyy-MM-dd");
      const label = format(date, "EEE");
      const daySessions = workSessions.filter((s) => s.date === dateStr);
      return {
        name: label,
        sessions: daySessions.length,
        minutes: daySessions.reduce((sum, s) => sum + s.duration, 0),
      };
    });
    return days;
  }, [workSessions]);

  const taskDistribution = useMemo(() => {
    const map = new Map<string, number>();
    workSessions.forEach((s) => {
      const name = s.taskName || "Unassigned";
      map.set(name, (map.get(name) || 0) + s.duration);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [workSessions]);

  const stats = [
    { label: "Focus Time", value: `${totalFocusHours.toFixed(1)}h`, icon: Clock, color: "#f59e0b" },
    { label: "Sessions", value: completedSessions, icon: Target, color: "#10b981" },
    { label: "Streak", value: `${currentStreak}d`, icon: Flame, color: "#ef4444" },
    { label: "Total XP", value: totalXP, icon: Zap, color: "#6366f1" },
  ];

  const isEmpty = sessions.length === 0;

  return (
    <div className="animate-slide-up space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card p-4">
              <div className="mb-2 flex items-center gap-2">
                <Icon size={16} style={{ color: stat.color }} />
                <span className="text-xs text-[var(--color-text-muted)]">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {isEmpty ? (
        <div className="glass-card flex flex-col items-center gap-3 py-16">
          <Calendar size={40} className="text-[var(--color-text-muted)]" />
          <p className="text-sm text-[var(--color-text-muted)]">No data yet</p>
          <p className="text-xs text-[var(--color-text-muted)]">Complete focus sessions to see your analytics</p>
        </div>
      ) : mounted ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass-card p-6">
            <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">Sessions per Day</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#f1f5f9" }}
                  labelStyle={{ color: "#94a3b8" }}
                />
                <Bar dataKey="sessions" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-6">
            <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">Focus Time Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#f1f5f9" }}
                  labelStyle={{ color: "#94a3b8" }}
                  formatter={(value) => [`${value} min`, "Focus Time"]}
                />
                <Area type="monotone" dataKey="minutes" stroke="#f59e0b" fill="url(#focusGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {taskDistribution.length > 0 && (
            <div className="glass-card p-6 lg:col-span-2">
              <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">Time by Task</h3>
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={taskDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {taskDistribution.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#f1f5f9" }}
                      formatter={(value) => [`${value} min`, "Time"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3">
                  {taskDistribution.map((entry, i) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-xs text-[var(--color-text-secondary)]">
                        {entry.name} ({entry.value}m)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
