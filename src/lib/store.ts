"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TimerMode = "work" | "shortBreak" | "longBreak";

export interface TimerSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
}

export interface Task {
  id: string;
  name: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  completed: boolean;
  createdAt: string;
}

export interface Session {
  id: string;
  date: string;
  duration: number;
  taskId: string | null;
  taskName: string;
  type: TimerMode;
  completedAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt: string | null;
  requirement: number;
  category: "sessions" | "streak" | "hours" | "tasks";
}

export interface ScheduledSession {
  id: string;
  dayOfWeek: number;
  time: string;
  duration: number;
  taskId: string | null;
  taskName: string;
  label: string;
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  connected: boolean;
  apiKey: string;
}

export interface PomodoroState {
  mode: TimerMode;
  timeLeft: number;
  isRunning: boolean;
  completedSessions: number;
  settings: TimerSettings;
  currentTaskId: string | null;
  tasks: Task[];
  sessions: Session[];
  achievements: Achievement[];
  totalXP: number;
  currentStreak: number;
  bestStreak: number;
  lastSessionDate: string | null;
  scheduledSessions: ScheduledSession[];
  integrations: Integration[];
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
  skipSession: () => void;
  setMode: (mode: TimerMode) => void;
  updateSettings: (settings: Partial<TimerSettings>) => void;
  setCurrentTask: (taskId: string | null) => void;
  addTask: (name: string, estimatedPomodoros: number) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  completeSession: () => void;
  addScheduledSession: (session: Omit<ScheduledSession, "id">) => void;
  deleteScheduledSession: (id: string) => void;
  updateScheduledSession: (id: string, session: Partial<ScheduledSession>) => void;
  toggleIntegration: (id: string) => void;
  updateApiKey: (id: string, key: string) => void;
}

const defaultAchievements: Achievement[] = [
  { id: "first-focus", name: "First Focus", description: "Complete your first focus session", icon: "Zap", unlocked: false, unlockedAt: null, requirement: 1, category: "sessions" },
  { id: "getting-started", name: "Getting Started", description: "Complete 5 focus sessions", icon: "Flame", unlocked: false, unlockedAt: null, requirement: 5, category: "sessions" },
  { id: "dedicated", name: "Dedicated", description: "Complete 25 focus sessions", icon: "Target", unlocked: false, unlockedAt: null, requirement: 25, category: "sessions" },
  { id: "century", name: "Century", description: "Complete 100 focus sessions", icon: "Award", unlocked: false, unlockedAt: null, requirement: 100, category: "sessions" },
  { id: "marathon", name: "Marathon", description: "Complete 500 focus sessions", icon: "Crown", unlocked: false, unlockedAt: null, requirement: 500, category: "sessions" },
  { id: "streak-3", name: "On Fire", description: "Maintain a 3-day streak", icon: "Flame", unlocked: false, unlockedAt: null, requirement: 3, category: "streak" },
  { id: "streak-7", name: "Streak Master", description: "Maintain a 7-day streak", icon: "Flame", unlocked: false, unlockedAt: null, requirement: 7, category: "streak" },
  { id: "streak-30", name: "Unstoppable", description: "Maintain a 30-day streak", icon: "Flame", unlocked: false, unlockedAt: null, requirement: 30, category: "streak" },
  { id: "hours-5", name: "Deep Worker", description: "Accumulate 5 hours of focus time", icon: "Clock", unlocked: false, unlockedAt: null, requirement: 5, category: "hours" },
  { id: "hours-25", name: "Focus Expert", description: "Accumulate 25 hours of focus time", icon: "Clock", unlocked: false, unlockedAt: null, requirement: 25, category: "hours" },
  { id: "hours-100", name: "Master of Time", description: "Accumulate 100 hours of focus time", icon: "Clock", unlocked: false, unlockedAt: null, requirement: 100, category: "hours" },
  { id: "tasks-5", name: "Task Crusher", description: "Complete 5 tasks", icon: "CheckCircle", unlocked: false, unlockedAt: null, requirement: 5, category: "tasks" },
];

const defaultIntegrations: Integration[] = [
  { id: "trello", name: "Trello", description: "Sync tasks with Trello boards.", connected: false, apiKey: "" },
  { id: "asana", name: "Asana", description: "Import tasks from Asana projects.", connected: false, apiKey: "" },
  { id: "google-calendar", name: "Google Calendar", description: "Sync sessions to your calendar.", connected: false, apiKey: "" },
];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getDurationForMode(mode: TimerMode, settings: TimerSettings): number {
  if (mode === "work") return settings.workDuration;
  if (mode === "shortBreak") return settings.shortBreakDuration;
  return settings.longBreakDuration;
}

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      mode: "work" as TimerMode,
      timeLeft: 25 * 60,
      isRunning: false,
      completedSessions: 0,
      settings: { workDuration: 25, shortBreakDuration: 5, longBreakDuration: 15, sessionsBeforeLongBreak: 4 },
      currentTaskId: null,
      tasks: [],
      sessions: [],
      achievements: defaultAchievements,
      totalXP: 0,
      currentStreak: 0,
      bestStreak: 0,
      lastSessionDate: null,
      scheduledSessions: [],
      integrations: defaultIntegrations,

      startTimer: () => set({ isRunning: true }),
      pauseTimer: () => set({ isRunning: false }),
      resetTimer: () => {
        const s = get();
        set({ timeLeft: getDurationForMode(s.mode, s.settings) * 60, isRunning: false });
      },
      tick: () => {
        const s = get();
        if (s.timeLeft <= 1) { s.completeSession(); }
        else { set({ timeLeft: s.timeLeft - 1 }); }
      },
      skipSession: () => {
        const s = get();
        let nextMode: TimerMode;
        let nc = s.completedSessions;
        if (s.mode === "work") {
          nc += 1;
          nextMode = nc % s.settings.sessionsBeforeLongBreak === 0 ? "longBreak" : "shortBreak";
        } else { nextMode = "work"; }
        set({ mode: nextMode, timeLeft: getDurationForMode(nextMode, s.settings) * 60, isRunning: false, completedSessions: nc });
      },
      setMode: (mode: TimerMode) => {
        const s = get();
        set({ mode, timeLeft: getDurationForMode(mode, s.settings) * 60, isRunning: false });
      },
      updateSettings: (ns: Partial<TimerSettings>) => {
        const s = get();
        const settings = { ...s.settings, ...ns };
        set({ settings, timeLeft: getDurationForMode(s.mode, settings) * 60 });
      },
      setCurrentTask: (taskId: string | null) => set({ currentTaskId: taskId }),
      addTask: (name: string, estimatedPomodoros: number) => {
        const task: Task = { id: generateId(), name, estimatedPomodoros, completedPomodoros: 0, completed: false, createdAt: new Date().toISOString() };
        set((st) => ({ tasks: [...st.tasks, task] }));
      },
      deleteTask: (id: string) => set((st) => ({
        tasks: st.tasks.filter((t) => t.id !== id),
        currentTaskId: st.currentTaskId === id ? null : st.currentTaskId,
      })),
      toggleTaskComplete: (id: string) => set((st) => ({
        tasks: st.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
      })),
      completeSession: () => {
        const state = get();
        const today = getToday();
        const currentTask = state.tasks.find((t) => t.id === state.currentTaskId);
        const sessionDuration = getDurationForMode(state.mode, state.settings);
        const session: Session = {
          id: generateId(), date: today, duration: sessionDuration,
          taskId: state.currentTaskId, taskName: currentTask?.name ?? "No task",
          type: state.mode, completedAt: new Date().toISOString(),
        };
        let newTasks = state.tasks;
        let newXP = state.totalXP;
        let newStreak = state.currentStreak;
        let newBestStreak = state.bestStreak;
        if (state.mode === "work" && state.currentTaskId) {
          newTasks = state.tasks.map((t) => t.id === state.currentTaskId ? { ...t, completedPomodoros: t.completedPomodoros + 1 } : t);
          newXP += 25;
        } else if (state.mode === "work") { newXP += 25; }
        else { newXP += 5; }
        if (state.mode === "work" && state.lastSessionDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];
          newStreak = state.lastSessionDate === yesterdayStr ? state.currentStreak + 1 : 1;
          newBestStreak = Math.max(newBestStreak, newStreak);
        }
        const workSessions = state.sessions.filter((s) => s.type === "work").length + (state.mode === "work" ? 1 : 0);
        const totalHours = state.sessions.filter((s) => s.type === "work").reduce((sum, s) => sum + s.duration, 0) / 60 + (state.mode === "work" ? state.settings.workDuration / 60 : 0);
        const completedTaskCount = newTasks.filter((t) => t.completed).length;
        const newAchievements = state.achievements.map((a) => {
          if (a.unlocked) return a;
          let current = 0;
          if (a.category === "sessions") current = workSessions;
          else if (a.category === "streak") current = newStreak;
          else if (a.category === "hours") current = totalHours;
          else if (a.category === "tasks") current = completedTaskCount;
          if (current >= a.requirement) { newXP += 50; return { ...a, unlocked: true, unlockedAt: new Date().toISOString() }; }
          return a;
        });
        let nextMode: TimerMode;
        let newCompletedSessions = state.completedSessions;
        if (state.mode === "work") {
          newCompletedSessions += 1;
          nextMode = newCompletedSessions % state.settings.sessionsBeforeLongBreak === 0 ? "longBreak" : "shortBreak";
        } else { nextMode = "work"; }
        set({
          mode: nextMode, timeLeft: getDurationForMode(nextMode, state.settings) * 60,
          isRunning: false, completedSessions: newCompletedSessions,
          sessions: [...state.sessions, session], tasks: newTasks,
          achievements: newAchievements, totalXP: newXP,
          currentStreak: newStreak, bestStreak: newBestStreak,
          lastSessionDate: state.mode === "work" ? today : state.lastSessionDate,
        });
      },
      addScheduledSession: (session) => set((st) => ({
        scheduledSessions: [...st.scheduledSessions, { ...session, id: generateId() }],
      })),
      deleteScheduledSession: (id: string) => set((st) => ({
        scheduledSessions: st.scheduledSessions.filter((s) => s.id !== id),
      })),
      updateScheduledSession: (id: string, updates: Partial<ScheduledSession>) => set((st) => ({
        scheduledSessions: st.scheduledSessions.map((s) => s.id === id ? { ...s, ...updates } : s),
      })),
      toggleIntegration: (id: string) => set((st) => ({
        integrations: st.integrations.map((i) => i.id === id ? { ...i, connected: !i.connected } : i),
      })),
      updateApiKey: (id: string, key: string) => set((st) => ({
        integrations: st.integrations.map((i) => i.id === id ? { ...i, apiKey: key } : i),
      })),
    }),
    {
      name: "pomodoro-storage",
      version: 1,
      partialize: (state) => ({
        completedSessions: state.completedSessions,
        settings: state.settings,
        currentTaskId: state.currentTaskId,
        tasks: state.tasks,
        sessions: state.sessions,
        achievements: state.achievements,
        totalXP: state.totalXP,
        currentStreak: state.currentStreak,
        bestStreak: state.bestStreak,
        lastSessionDate: state.lastSessionDate,
        scheduledSessions: state.scheduledSessions,
        integrations: state.integrations.map((i) => ({ ...i, apiKey: "" })),
      }),
    }
  )
);
