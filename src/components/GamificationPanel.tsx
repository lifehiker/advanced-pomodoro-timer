"use client";

import { useMemo } from "react";
import {
  Zap, Flame, Target, Award, Crown, Clock, CheckCircle, Trophy, Lock, Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePomodoroStore } from "@/lib/store";
import type { Achievement } from "@/lib/store";

const iconMap: Record<string, LucideIcon> = {
  Zap, Flame, Target, Award, Crown, Clock, CheckCircle,
};

export default function GamificationPanel() {
  const { achievements, totalXP, currentStreak, bestStreak, sessions, tasks } = usePomodoroStore();

  const level = Math.floor(totalXP / 100) + 1;
  const xpInLevel = totalXP % 100;
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const workSessions = useMemo(() => sessions.filter((s) => s.type === "work"), [sessions]);
  const totalFocusHours = useMemo(() => workSessions.reduce((sum, s) => sum + s.duration, 0) / 60, [workSessions]);
  const completedTaskCount = useMemo(() => tasks.filter((t) => t.completed).length, [tasks]);

  const getCategoryProgress = (a: Achievement): number => {
    switch (a.category) {
      case "sessions": return workSessions.length;
      case "streak": return currentStreak;
      case "hours": return totalFocusHours;
      case "tasks": return completedTaskCount;
    }
  };

  const formatProgress = (current: number, category: string): string => {
    if (category === "hours") return `${current.toFixed(1)}h`;
    if (category === "streak") return `${current}d`;
    return `${current}`;
  };

  const stats = [
    { label: "Total XP", value: totalXP.toLocaleString(), icon: Zap, color: "#f59e0b" },
    { label: "Current Streak", value: `${currentStreak} days`, icon: Flame, color: "#ef4444" },
    { label: "Best Streak", value: `${bestStreak} days`, icon: Star, color: "#8b5cf6" },
    { label: "Level", value: level, icon: Trophy, color: "#10b981" },
  ];

  return (
    <div className="animate-slide-up space-y-6">
      <div className="glass-card p-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Trophy size={20} style={{ color: "var(--color-accent-work)" }} />
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Achievements</h2>
          </div>
          <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: "var(--color-accent-work-dim)", color: "var(--color-accent-work)" }}>
            {unlockedCount}/{achievements.length} unlocked
          </span>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-xl bg-white/[0.03] p-3">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <Icon size={14} style={{ color: stat.color }} />
                  <span className="text-xs text-[var(--color-text-muted)]">{stat.label}</span>
                </div>
                <p className="text-xl font-bold text-[var(--color-text-primary)]">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-[var(--color-text-muted)]">Level {level} Progress</span>
            <span className="text-xs text-[var(--color-text-muted)]">{xpInLevel}/100 XP</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${xpInLevel}%`,
                background: "linear-gradient(90deg, #f59e0b, #f97316)",
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {achievements.map((achievement) => {
          const Icon = iconMap[achievement.icon] || Trophy;
          const progress = getCategoryProgress(achievement);
          const progressPct = Math.min(100, (progress / achievement.requirement) * 100);

          return (
            <div
              key={achievement.id}
              className="glass-card overflow-hidden p-4 transition-all"
              style={{
                opacity: achievement.unlocked ? 1 : 0.6,
                borderColor: achievement.unlocked ? "rgba(245, 158, 11, 0.3)" : undefined,
                boxShadow: achievement.unlocked ? "0 0 20px rgba(245, 158, 11, 0.1)" : undefined,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: achievement.unlocked ? "var(--color-accent-work-dim)" : "rgba(255,255,255,0.05)",
                  }}
                >
                  {achievement.unlocked ? (
                    <Icon size={20} style={{ color: "var(--color-accent-work)" }} />
                  ) : (
                    <Lock size={16} className="text-[var(--color-text-muted)]" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{achievement.name}</h3>
                    {achievement.unlocked && (
                      <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">+50 XP</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{achievement.description}</p>

                  {!achievement.unlocked && (
                    <div className="mt-2">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[10px] text-[var(--color-text-muted)]">
                          {formatProgress(progress, achievement.category)} / {formatProgress(achievement.requirement, achievement.category)}
                        </span>
                        <span className="text-[10px] text-[var(--color-text-muted)]">{Math.round(progressPct)}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${progressPct}%`, backgroundColor: "var(--color-accent-work)" }}
                        />
                      </div>
                    </div>
                  )}

                  {achievement.unlocked && achievement.unlockedAt && (
                    <p className="mt-1.5 text-[10px] text-[var(--color-text-muted)]">
                      Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
