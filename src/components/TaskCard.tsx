"use client";

import { useState } from "react";
import type { Task } from "@/lib/tasks/types";
import { useTasks } from "@/lib/tasks/useTasks";
import { capitalize, formatDueDate, formatTimeEstimate } from "@/lib/tasks/format";
import { PriorityChip } from "./PriorityChip";

function ReturnIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14 4 9l5-5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
    </svg>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
      {children}
    </span>
  );
}

function MetaBadges({ task }: { task: Task }) {
  if (!task.due_date && !task.time_estimate_min && task.tags.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {task.due_date && <Badge>{formatDueDate(task.due_date)}</Badge>}
      {task.time_estimate_min && (
        <Badge>{formatTimeEstimate(task.time_estimate_min)}</Badge>
      )}
      {task.tags.map((tag) => (
        <Badge key={tag}>#{tag}</Badge>
      ))}
    </div>
  );
}

export function InboxTaskCard({ task }: { task: Task }) {
  const { cyclePriority, updateTask } = useTasks();
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start gap-3">
        <button
          type="button"
          className="min-h-11 flex-1 text-left"
          onClick={() => setOpen((v) => !v)}
        >
          {task.unparsed && (
            <span className="mb-1 inline-block rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-500/20 dark:text-orange-300">
              перевір руками
            </span>
          )}
          <div className="font-medium text-zinc-900 dark:text-zinc-50">
            {capitalize(task.title)}
          </div>
          {task.source_text && task.source_text !== task.title && (
            <p className="mt-1 text-sm italic text-zinc-400 dark:text-zinc-500">
              &ldquo;{task.source_text}&rdquo;
            </p>
          )}
        </button>
        <PriorityChip priority={task.priority} onClick={() => cyclePriority(task.id)} />
      </div>

      <div className="mt-2">
        <MetaBadges task={task} />
      </div>

      {open && (
        <div className="mt-3 space-y-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <label className="block text-xs text-zinc-500">
            Назва
            <input
              type="text"
              defaultValue={task.title}
              onBlur={(e) => updateTask(task.id, { title: e.target.value })}
              className="mt-1 min-h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
          </label>
          <div className="flex gap-2">
            <label className="block min-w-0 flex-1 text-xs text-zinc-500">
              Дедлайн
              <input
                type="date"
                defaultValue={task.due_date ?? ""}
                onChange={(e) =>
                  updateTask(task.id, { due_date: e.target.value || undefined })
                }
                className="mt-1 min-h-11 w-full min-w-0 rounded-lg border border-zinc-200 px-3 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              />
            </label>
            <label className="block min-w-0 flex-1 text-xs text-zinc-500">
              Хвилин
              <input
                type="number"
                min={0}
                defaultValue={task.time_estimate_min ?? ""}
                onBlur={(e) =>
                  updateTask(task.id, {
                    time_estimate_min: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                className="mt-1 min-h-11 w-full min-w-0 rounded-lg border border-zinc-200 px-3 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              />
            </label>
          </div>
          <label className="block text-xs text-zinc-500">
            Теги (через кому)
            <input
              type="text"
              defaultValue={task.tags.join(", ")}
              onBlur={(e) =>
                updateTask(task.id, {
                  tags: e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
              className="mt-1 min-h-11 w-full rounded-lg border border-zinc-200 px-3 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
          </label>
        </div>
      )}
    </div>
  );
}

export function TodayTaskCard({ task }: { task: Task }) {
  const { cyclePriority, toggleDone, returnToInbox } = useTasks();

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white py-4 pl-3 pr-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <button
        type="button"
        onClick={() => toggleDone(task.id)}
        aria-label="Позначити виконаною"
        className="flex min-h-11 min-w-11 shrink-0 items-center justify-center"
      >
        <span className="h-6 w-6 rounded-full border-2 border-zinc-300 dark:border-zinc-600" />
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
          {capitalize(task.title)}
        </p>
        {task.time_estimate_min && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            {formatTimeEstimate(task.time_estimate_min)}
          </p>
        )}
      </div>

      <PriorityChip priority={task.priority} onClick={() => cyclePriority(task.id)} />

      <button
        type="button"
        onClick={() => returnToInbox(task.id)}
        aria-label="Повернути у Вхідні"
        className="flex min-h-11 min-w-11 shrink-0 items-center justify-center text-zinc-400"
      >
        <ReturnIcon />
      </button>
    </div>
  );
}
