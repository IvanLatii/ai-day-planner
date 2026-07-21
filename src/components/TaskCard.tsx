"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Task } from "@/lib/tasks/types";
import { useTasks } from "@/lib/tasks/useTasks";
import { capitalize, formatDueDate, formatTimeEstimate, isOverdue } from "@/lib/tasks/format";
import { PriorityChip, PRIORITY_CHECKBOX_BORDER } from "./PriorityChip";
import { TodayIcon, ClockIcon } from "./icons";

function XIcon({ className = "h-2.5 w-2.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className={className}>
      <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function MoveToTodayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-3.5 w-3.5 text-white dark:text-zinc-900">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

// Fixed h-11 (not min-h-11) + no border keeps date/number/text inputs pixel
// identical — native UA styling otherwise gives type=date extra intrinsic
// height that a min-height alone doesn't override.
export const FIELD_CLASS =
  "mt-1 h-11 w-full min-w-0 rounded-lg bg-zinc-100 px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-300 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-600";

export function TagEditor({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  function commit() {
    const value = draft.trim();
    if (value && !tags.includes(value)) onChange([...tags, value]);
    setDraft("");
    setAdding(false);
  }

  function remove(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="flex h-8 items-center gap-1 rounded-full bg-zinc-100 pl-3 pr-1.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
        >
          #{tag}
          <button
            type="button"
            onClick={() => remove(tag)}
            aria-label={`Видалити тег ${tag}`}
            className="-m-1 flex h-6 w-6 items-center justify-center rounded-full text-zinc-400 active:scale-95 dark:text-zinc-500"
          >
            <XIcon />
          </button>
        </span>
      ))}
      {adding ? (
        <input
          autoFocus
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
            if (e.key === "Escape") {
              setDraft("");
              setAdding(false);
            }
          }}
          onBlur={commit}
          placeholder="тег"
          className="h-8 w-24 rounded-full bg-zinc-100 px-3 text-xs text-zinc-900 outline-none dark:bg-zinc-800 dark:text-zinc-50"
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          aria-label="Додати тег"
          className="flex h-8 min-w-8 items-center justify-center rounded-full bg-zinc-100 px-3 text-sm font-medium text-zinc-500 active:scale-95 dark:bg-zinc-800 dark:text-zinc-400"
        >
          +
        </button>
      )}
    </div>
  );
}

// Single row (date/time/tags) again — the two-row split read as too tall
// on real data. To keep the row from breaking up raggedly with 2-3 tags
// (the reason it was split in the first place), cap visible tags at 2 and
// collapse the rest into a plain "+N" indicator (not clickable — the full
// list is on the detail screen).
function TaskMeta({ task }: { task: Task }) {
  if (!task.due_date && !task.time_estimate_min && task.tags.length === 0) {
    return null;
  }
  const visibleTags = task.tags.slice(0, 2);
  const hiddenTagCount = task.tags.length - visibleTags.length;

  return (
    <p className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-zinc-400 dark:text-zinc-500">
      {task.due_date && (
        <span
          className={`flex items-center gap-1 ${
            task.status !== "done" && isOverdue(task.due_date)
              ? "text-rose-500 dark:text-rose-400"
              : ""
          }`}
        >
          <TodayIcon className="h-3 w-3" />
          {formatDueDate(task.due_date)}
        </span>
      )}
      {task.time_estimate_min && (
        <span className="flex items-center gap-1">
          <ClockIcon />
          {formatTimeEstimate(task.time_estimate_min)}
        </span>
      )}
      {visibleTags.map((tag) => (
        <span
          key={tag}
          className="rounded bg-zinc-100 px-1.5 py-0.5 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
        >
          #{tag}
        </span>
      ))}
      {hiddenTagCount > 0 && <span>+{hiddenTagCount}</span>}
    </p>
  );
}

export function InboxTaskCard({
  task,
  onMove,
}: {
  task: Task;
  onMove?: (task: Task) => void;
}) {
  const { cyclePriority, moveToToday } = useTasks();
  const router = useRouter();

  return (
    <div className="py-3">
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="min-h-11 min-w-0 flex-1 text-left"
          onClick={() => router.push(`/task/${task.id}`)}
        >
          {task.unparsed && (
            <span className="mb-1 inline-block rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-500/20 dark:text-orange-300">
              перевір руками
            </span>
          )}
          <div className="font-medium text-zinc-900 dark:text-zinc-50">
            {capitalize(task.title)}
          </div>
          {task.unparsed && task.source_text && task.source_text !== task.title && (
            <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
              &ldquo;{task.source_text}&rdquo;
            </p>
          )}
          <TaskMeta task={task} />
        </button>
        <button
          type="button"
          onClick={() => {
            moveToToday(task.id);
            onMove?.(task);
          }}
          aria-label="Перенести у Сьогодні"
          className="flex min-h-11 min-w-11 shrink-0 items-center justify-center text-zinc-400 active:scale-95 dark:text-zinc-500"
        >
          <MoveToTodayIcon />
        </button>
        <PriorityChip priority={task.priority} onClick={() => cyclePriority(task.id)} />
      </div>
    </div>
  );
}

export function TodayTaskCard({
  task,
  onDone,
}: {
  task: Task;
  onDone?: (task: Task) => void;
}) {
  const { toggleDone } = useTasks();
  const router = useRouter();
  const isDone = task.status === "done";

  return (
    <div className="flex items-center gap-1 py-3">
      <button
        type="button"
        onClick={() => {
          toggleDone(task.id);
          onDone?.(task);
        }}
        aria-label={isDone ? "Скасувати виконання" : "Позначити виконаною"}
        className="-ml-2.5 flex min-h-11 min-w-11 shrink-0 items-center justify-center"
      >
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
            isDone
              ? "border-zinc-900 bg-zinc-900 dark:border-zinc-50 dark:bg-zinc-50"
              : PRIORITY_CHECKBOX_BORDER[task.priority]
          }`}
        >
          {isDone && <CheckIcon />}
        </span>
      </button>

      <button
        type="button"
        onClick={() => router.push(`/task/${task.id}`)}
        className="min-w-0 flex-1 text-left"
      >
        <p
          className={`truncate font-medium ${
            isDone
              ? "text-zinc-400 line-through dark:text-zinc-500"
              : "text-zinc-900 dark:text-zinc-50"
          }`}
        >
          {capitalize(task.title)}
        </p>
        <TaskMeta task={task} />
      </button>
    </div>
  );
}
