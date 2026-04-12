"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, SkipForward, Settings, ChevronDown } from "lucide-react";
import { usePomodoroStore } from "@/lib/store";
import type { TimerMode } from "@/lib/store";

const modeLabels: Record<TimerMode, string> = {
  work: "Focus Time",
  shortBreak: "Short Break",
  longBreak: "Long Break",
};

const modeColors: Record<TimerMode, { accent: string; glow: string; ring: string }> = {
  work: { accent: "var(--color-accent-work)", glow: "var(--color-accent-work-glow)", ring: "stroke-amber-500" },
  shortBreak: { accent: "var(--color-accent-break)", glow: "var(--color-accent-break-glow)", ring: "stroke-emerald-500" },
  longBreak: { accent: "var(--color-accent-long-break)", glow: "var(--color-accent-long-break-glow)", ring: "stroke-indigo-500" },
};

export default function TimerDisplay() {
  const store = usePomodoroStore();
  const { mode, timeLeft, isRunning, completedSessions, settings, currentTaskId, tasks } = store;

  const [showSettings, setShowSettings] = useState(false);
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    let lastTick = Date.now();
    const doTick = () => {
      lastTick = Date.now();
      store.tick();
    };
    intervalRef.current = setInterval(doTick, 1000);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        const missed = Math.floor((Date.now() - lastTick) / 1000);
        if (missed > 1) {
          const s = usePomodoroStore.getState();
          const remaining = s.timeLeft - missed;
          if (remaining <= 0) {
            s.completeSession();
          } else {
            usePomodoroStore.setState({ timeLeft: remaining });
          }
          lastTick = Date.now();
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isRunning, store]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowTaskDropdown(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const prevRunningRef = useRef(false);
  const prevModeRef = useRef(mode);
  useEffect(() => {
    const wasRunning = prevRunningRef.current;
    const modeChanged = prevModeRef.current !== mode;
    prevRunningRef.current = isRunning;
    prevModeRef.current = mode;
    if (wasRunning && !isRunning && modeChanged) {
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 800;
        gain.gain.value = 0.3;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.stop(ctx.currentTime + 0.5);
      } catch {}
    }
  }, [mode, isRunning]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const dur = mode === "work" ? settings.workDuration : mode === "shortBreak" ? settings.shortBreakDuration : settings.longBreakDuration;
  const progress = 1 - timeLeft / (dur * 60);
  const colors = modeColors[mode];
  const currentTask = tasks.find((t) => t.id === currentTaskId);
  const incompleteTasks = tasks.filter((t) => !t.completed);
  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference * (1 - progress);
  const sessionDots = Array.from({ length: settings.sessionsBeforeLongBreak }, (_, i) => i < (completedSessions % settings.sessionsBeforeLongBreak));

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="glass-card w-full max-w-lg p-8" style={{ boxShadow: isRunning ? `0 0 80px ${colors.glow}` : undefined }}>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-2">
            {(["work", "shortBreak", "longBreak"] as const).map((m) => (
              <button
                key={m}
                onClick={() => store.setMode(m)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  mode === m ? "text-black shadow-md" : "text-[var(--color-text-secondary)] hover:bg-white/5"
                }`}
                style={mode === m ? { backgroundColor: modeColors[m].accent } : undefined}
              >
                {m === "work" ? "Focus" : m === "shortBreak" ? "Short" : "Long"}
              </button>
            ))}
          </div>
          <button onClick={() => setShowSettings(!showSettings)} className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--color-text-primary)]">
            <Settings size={18} />
          </button>
        </div>

        <div className="relative mx-auto mb-6 flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 300 300">
            <circle cx="150" cy="150" r="140" fill="none" stroke="var(--color-border)" strokeWidth="4" />
            <circle cx="150" cy="150" r="140" fill="none" className={colors.ring} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} style={{ transition: "stroke-dashoffset 0.5s ease" }} />
          </svg>
          {isRunning && (
            <div className="absolute inset-2 animate-pulse-ring rounded-full" style={{ border: `2px solid ${colors.glow}` }} />
          )}
          <div className="relative z-10 text-center">
            <div className="text-6xl font-extralight tracking-wider text-[var(--color-text-primary)] sm:text-7xl" style={{ fontVariantNumeric: "tabular-nums" }}>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </div>
            <div className="mt-2 text-sm font-medium" style={{ color: colors.accent }}>{modeLabels[mode]}</div>
            {currentTask && <div className="mt-1 text-xs text-[var(--color-text-muted)]">{currentTask.name}</div>}
          </div>
        </div>

        <div className="mb-4 flex items-center justify-center gap-1.5">
          {sessionDots.map((completed, i) => (
            <div key={i} className="h-2 w-2 rounded-full transition-all"
              style={{ backgroundColor: completed ? colors.accent : "var(--color-border)", boxShadow: completed ? `0 0 6px ${colors.glow}` : "none" }} />
          ))}
        </div>

        <div className="flex items-center justify-center gap-3">
          <button onClick={store.resetTimer} className="rounded-xl p-3 text-[var(--color-text-muted)] transition-all hover:bg-white/5 hover:text-[var(--color-text-primary)]">
            <RotateCcw size={20} />
          </button>
          <button onClick={isRunning ? store.pauseTimer : store.startTimer}
            className="rounded-2xl px-10 py-3.5 text-base font-semibold text-black transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: colors.accent, boxShadow: `0 4px 20px ${colors.glow}` }}>
            <span className="flex items-center gap-2">
              {isRunning ? <><Pause size={20} /> Pause</> : <><Play size={20} /> Start</>}
            </span>
          </button>
          <button onClick={store.skipSession} className="rounded-xl p-3 text-[var(--color-text-muted)] transition-all hover:bg-white/5 hover:text-[var(--color-text-primary)]">
            <SkipForward size={20} />
          </button>
        </div>

        <div className="relative mt-6" ref={dropdownRef}>
          <button onClick={() => setShowTaskDropdown(!showTaskDropdown)}
            className="mx-auto flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-white/5">
            <span>{currentTask ? currentTask.name : "Select a task..."}</span>
            <ChevronDown size={14} />
          </button>
          {showTaskDropdown && (
            <div className="glass-card absolute left-1/2 z-20 mt-2 w-64 -translate-x-1/2 p-2">
              <button onClick={() => { store.setCurrentTask(null); setShowTaskDropdown(false); }}
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--color-text-muted)] hover:bg-white/5">No task</button>
              {incompleteTasks.map((task) => (
                <button key={task.id} onClick={() => { store.setCurrentTask(task.id); setShowTaskDropdown(false); }}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-white/5 ${
                    currentTaskId === task.id ? "text-[var(--color-accent-work)]" : "text-[var(--color-text-primary)]"
                  }`}>
                  {task.name}<span className="ml-2 text-xs text-[var(--color-text-muted)]">{task.completedPomodoros}/{task.estimatedPomodoros}</span>
                </button>
              ))}
              {incompleteTasks.length === 0 && <p className="px-3 py-2 text-xs text-[var(--color-text-muted)]">No tasks yet. Add one in the task panel.</p>}
            </div>
          )}
        </div>

        {showSettings && (
          <div className="mt-6 animate-slide-up rounded-xl bg-white/5 p-4">
            <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">Timer Settings</h3>
            <div className="grid grid-cols-2 gap-3">
              {([
                ["Work (min)", "workDuration", settings.workDuration],
                ["Short Break (min)", "shortBreakDuration", settings.shortBreakDuration],
                ["Long Break (min)", "longBreakDuration", settings.longBreakDuration],
                ["Sessions before long break", "sessionsBeforeLongBreak", settings.sessionsBeforeLongBreak],
              ] as [string, string, number][]).map(([label, key, value]) => (
                <div key={key}>
                  <label className="mb-1 block text-xs text-[var(--color-text-muted)]">{label}</label>
                  <input type="number" value={value}
                    onChange={(e) => store.updateSettings({ [key]: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-work)]"
                    min={1} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
