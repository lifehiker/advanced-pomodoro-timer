"use client";

import { useState } from "react";
import { Plus, Trash2, Check, Circle, ListTodo, Target } from "lucide-react";
import { usePomodoroStore } from "@/lib/store";

export default function TaskManager() {
  const { tasks, currentTaskId, addTask, deleteTask, toggleTaskComplete, setCurrentTask } = usePomodoroStore();
  const [name, setName] = useState("");
  const [estimated, setEstimated] = useState(1);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addTask(name.trim(), estimated);
    setName("");
    setEstimated(1);
  };

  const incomplete = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  return (
    <div className="glass-card animate-slide-up p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ListTodo size={18} style={{ color: "var(--color-accent-work)" }} />
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Tasks</h2>
        </div>
        {incomplete.length > 0 && (
          <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: "var(--color-accent-work-dim)", color: "var(--color-accent-work)" }}>
            {incomplete.length} remaining
          </span>
        )}
      </div>

      <form onSubmit={handleAdd} className="mb-5 flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add a task..."
          className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent-work)]"
        />
        <input
          type="number"
          value={estimated}
          onChange={(e) => setEstimated(Math.max(1, parseInt(e.target.value) || 1))}
          min={1}
          className="w-16 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-2 py-2 text-center text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-work)]"
          title="Estimated pomodoros"
        />
        <button
          type="submit"
          className="rounded-lg p-2 transition-all hover:scale-105 active:scale-95"
          style={{ backgroundColor: "var(--color-accent-work)", color: "black" }}
        >
          <Plus size={18} />
        </button>
      </form>

      <div className="space-y-1.5">
        {incomplete.length === 0 && completed.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-8 text-[var(--color-text-muted)]">
            <Target size={32} />
            <p className="text-sm">No tasks yet</p>
            <p className="text-xs">Add a task to get started</p>
          </div>
        )}

        {incomplete.map((task) => (
          <div
            key={task.id}
            onClick={() => setCurrentTask(currentTaskId === task.id ? null : task.id)}
            className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-all hover:bg-white/5"
            style={currentTaskId === task.id ? { backgroundColor: "var(--color-accent-work-dim)", borderLeft: "2px solid var(--color-accent-work)" } : { borderLeft: "2px solid transparent" }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); toggleTaskComplete(task.id); }}
              className="shrink-0 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-success)]"
            >
              <Circle size={18} />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-[var(--color-text-primary)]">{task.name}</p>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (task.completedPomodoros / task.estimatedPomodoros) * 100)}%`,
                      backgroundColor: "var(--color-accent-work)",
                    }}
                  />
                </div>
                <span className="shrink-0 text-xs text-[var(--color-text-muted)]">
                  {task.completedPomodoros}/{task.estimatedPomodoros}
                </span>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
              className="shrink-0 text-[var(--color-text-muted)] transition-all sm:opacity-0 sm:group-hover:opacity-100 hover:text-[var(--color-danger)]"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}

        {completed.length > 0 && (
          <>
            <div className="pb-1 pt-3">
              <p className="text-xs font-medium text-[var(--color-text-muted)]">Completed ({completed.length})</p>
            </div>
            {completed.map((task) => (
              <div
                key={task.id}
                className="group flex items-center gap-3 rounded-xl px-3 py-2 transition-all hover:bg-white/5"
              >
                <button
                  onClick={() => toggleTaskComplete(task.id)}
                  className="shrink-0 text-[var(--color-success)] transition-colors"
                >
                  <Check size={18} />
                </button>
                <p className="flex-1 truncate text-sm text-[var(--color-text-muted)] line-through">{task.name}</p>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="shrink-0 text-[var(--color-text-muted)] transition-all sm:opacity-0 sm:group-hover:opacity-100 hover:text-[var(--color-danger)]"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
