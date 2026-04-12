"use client";

import { useState } from "react";
import { Calendar, Clock, Plus, Trash2, Edit3, Check, X } from "lucide-react";
import { usePomodoroStore } from "@/lib/store";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

function formatTime12(time24: string): string {
  const [h, m] = time24.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function SchedulePanel() {
  const { scheduledSessions, tasks, addScheduledSession, deleteScheduledSession, updateScheduledSession } = usePomodoroStore();
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [time, setTime] = useState("09:00");
  const [duration, setDuration] = useState(25);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");

  const incompleteTasks = tasks.filter((t) => !t.completed);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    const selectedTask = tasks.find((t) => t.id === taskId);
    addScheduledSession({
      dayOfWeek, time, duration, taskId,
      taskName: selectedTask?.name || "",
      label: label.trim(),
    });
    setLabel("");
  };

  const handleSaveEdit = (id: string) => {
    if (editLabel.trim()) updateScheduledSession(id, { label: editLabel.trim() });
    setEditingId(null);
  };

  const sessionsByDay = DAY_ORDER.map((day) => ({
    day, dayName: DAYS[day],
    sessions: scheduledSessions.filter((s) => s.dayOfWeek === day).sort((a, b) => a.time.localeCompare(b.time)),
  })).filter((d) => d.sessions.length > 0);

  const inputClass = "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-work)]";

  return (
    <div className="animate-slide-up space-y-6">
      <div className="glass-card p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: "var(--color-accent-work-dim)" }}>
            <Calendar size={20} style={{ color: "var(--color-accent-work)" }} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Schedule</h2>
            <p className="text-xs text-[var(--color-text-muted)]">Plan your weekly focus sessions</p>
          </div>
        </div>

        <form onSubmit={handleAdd} className="mb-6 rounded-xl bg-white/3 p-4">
          <h3 className="mb-3 text-sm font-medium text-[var(--color-text-primary)]">Add Session</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Day</label>
              <select value={dayOfWeek} onChange={(e) => setDayOfWeek(Number(e.target.value))} className={inputClass}>
                {DAY_ORDER.map((d) => (<option key={d} value={d}>{DAYS[d]}</option>))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Time</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Duration (min)</label>
              <input type="number" value={duration} onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))} min={1} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Task (optional)</label>
              <select value={taskId || ""} onChange={(e) => setTaskId(e.target.value || null)} className={inputClass}>
                <option value="">No task</option>
                {incompleteTasks.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Label</label>
              <div className="flex gap-2">
                <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Morning deep work..."
                  className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent-work)]" />
                <button type="submit" className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-black transition-all hover:scale-105 active:scale-95"
                  style={{ backgroundColor: "var(--color-accent-work)" }}>
                  <Plus size={16} /> Add
                </button>
              </div>
            </div>
          </div>
        </form>

        {sessionsByDay.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-[var(--color-text-muted)]">
            <Clock size={36} />
            <p className="text-sm">No sessions scheduled</p>
            <p className="text-xs">Add a session to plan your week</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessionsByDay.map(({ day, dayName, sessions: daySessions }) => (
              <div key={day}>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">{dayName}</h3>
                <div className="space-y-1.5">
                  {daySessions.map((session) => (
                    <div key={session.id} className="group flex items-center gap-3 rounded-xl bg-white/3 px-4 py-3 transition-all hover:bg-white/6">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--color-accent-work-dim)" }}>
                        <Clock size={14} style={{ color: "var(--color-accent-work)" }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        {editingId === session.id ? (
                          <div className="flex items-center gap-2">
                            <input type="text" value={editLabel} onChange={(e) => setEditLabel(e.target.value)}
                              onKeyDown={(e) => { if (e.key === "Enter") handleSaveEdit(session.id); if (e.key === "Escape") setEditingId(null); }}
                              className="flex-1 rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-2 py-1 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-work)]" autoFocus />
                            <button onClick={() => handleSaveEdit(session.id)} className="text-green-400 hover:text-green-300"><Check size={14} /></button>
                            <button onClick={() => setEditingId(null)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"><X size={14} /></button>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm font-medium text-[var(--color-text-primary)]">{session.label}</p>
                            <div className="mt-0.5 flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
                              <span>{formatTime12(session.time)}</span>
                              <span>{session.duration} min</span>
                              {session.taskName && <span className="text-[var(--color-accent-work)]">{session.taskName}</span>}
                            </div>
                          </>
                        )}
                      </div>
                      {editingId !== session.id && (
                        <div className="flex shrink-0 items-center gap-1 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                          <button onClick={() => { setEditingId(session.id); setEditLabel(session.label); }} className="rounded p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--color-text-primary)]">
                            <Edit3 size={13} />
                          </button>
                          <button onClick={() => deleteScheduledSession(session.id)} className="rounded p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--color-danger)]">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
