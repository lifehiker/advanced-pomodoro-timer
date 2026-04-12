"use client";

import { useState } from "react";
import { Timer, BarChart3, Puzzle, Trophy, Calendar } from "lucide-react";
import TimerDisplay from "@/components/TimerDisplay";
import TaskManager from "@/components/TaskManager";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import IntegrationsPanel from "@/components/IntegrationsPanel";
import GamificationPanel from "@/components/GamificationPanel";
import SchedulePanel from "@/components/SchedulePanel";

const tabs = [
  { id: "timer", label: "Timer", icon: Timer },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "integrations", label: "Integrations", icon: Puzzle },
  { id: "achievements", label: "Achievements", icon: Trophy },
  { id: "schedule", label: "Schedule", icon: Calendar },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("timer");

  return (
    <main className="min-h-screen bg-[var(--color-bg-primary)]">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Focus Flow
            </span>
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Advanced Pomodoro Timer
          </p>
        </header>

        <nav className="mb-8 flex justify-center">
          <div className="glass-card inline-flex gap-1 p-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-[var(--color-accent-work)] text-black shadow-lg shadow-amber-500/20"
                      : "text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="animate-fade-in">
          {activeTab === "timer" && (
            <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
              <TimerDisplay />
              <TaskManager />
            </div>
          )}
          {activeTab === "analytics" && <AnalyticsDashboard />}
          {activeTab === "integrations" && <IntegrationsPanel />}
          {activeTab === "achievements" && <GamificationPanel />}
          {activeTab === "schedule" && <SchedulePanel />}
        </div>
      </div>
    </main>
  );
}
