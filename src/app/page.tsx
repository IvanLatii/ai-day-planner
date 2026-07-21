"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTasks } from "@/lib/tasks/useTasks";
import { TodayTaskCard } from "@/components/TaskCard";
import { EmptyState } from "@/components/EmptyState";
import { pluralizeTasks } from "@/lib/tasks/format";
import { sortTodayByTime } from "@/lib/tasks/sort";
import { PAGE_HEADING_CLASS } from "@/lib/ui";
import type { Task } from "@/lib/tasks/types";

const TOAST_DURATION_MS = 4000;
const SORT_MODE_KEY = "ai-day-planner:today-sort";
type SortMode = "priority" | "time";

function SortModeToggle({
  mode,
  onChange,
}: {
  mode: SortMode;
  onChange: (mode: SortMode) => void;
}) {
  return (
    <div className="flex w-fit self-start rounded-md bg-zinc-100 p-1 dark:bg-zinc-800">
      {(
        [
          ["priority", "За пріоритетом"],
          ["time", "За часом"],
        ] as const
      ).map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={`h-7 rounded px-3 text-xs font-medium transition-colors ${
            mode === value
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
              : "text-zinc-500 dark:text-zinc-400"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function UndoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14 4 9l5-5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
    </svg>
  );
}

function DoneToast({ onUndo }: { onUndo: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-[calc(68px+env(safe-area-inset-bottom))] z-20 flex justify-center px-4">
      <div className="flex w-full items-center justify-between gap-3 rounded-md bg-zinc-700 px-4 py-3 text-sm text-white shadow-lg dark:bg-zinc-300 dark:text-zinc-900">
        <span className="font-medium">Виконано</span>
        <button type="button" onClick={onUndo} className="flex shrink-0 items-center gap-1.5 font-semibold">
          <UndoIcon />
          Відмінити
        </button>
      </div>
    </div>
  );
}

export default function TodayPage() {
  const { isLoaded, hasAnyTasks, inboxTasks, todayTasks, toggleDone } = useTasks();
  const [doneToast, setDoneToast] = useState<Task | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("priority");

  useEffect(() => {
    const stored = window.localStorage.getItem(SORT_MODE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored === "time") setSortMode("time");
  }, []);

  const handleSortChange = useCallback((mode: SortMode) => {
    setSortMode(mode);
    window.localStorage.setItem(SORT_MODE_KEY, mode);
  }, []);

  const handleDone = useCallback((task: Task) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setDoneToast(task);
    toastTimerRef.current = window.setTimeout(() => setDoneToast(null), TOAST_DURATION_MS);
  }, []);

  const handleUndo = useCallback(() => {
    if (!doneToast) return;
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toggleDone(doneToast.id);
    setDoneToast(null);
  }, [doneToast, toggleDone]);

  if (!isLoaded) return null;

  if (todayTasks.length === 0) {
    return (
      <>
        <EmptyState variant={inboxTasks.length > 0 ? "today-has-inbox" : "today-new"} />
        {doneToast && <DoneToast onUndo={handleUndo} />}
      </>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3 px-6 py-6">
      <div className="flex flex-col gap-1.5">
        <h1 className={PAGE_HEADING_CLASS}>Сьогодні</h1>
        {hasAnyTasks && inboxTasks.length > 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            У Вхідних ще {inboxTasks.length} {pluralizeTasks(inboxTasks.length)} на
            розгляд.
          </p>
        )}
      </div>
      <SortModeToggle mode={sortMode} onChange={handleSortChange} />
      <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
        {(sortMode === "time" ? sortTodayByTime(todayTasks) : todayTasks).map((task) => (
          <TodayTaskCard key={task.id} task={task} onDone={handleDone} />
        ))}
      </div>
      {doneToast && <DoneToast onUndo={handleUndo} />}
    </div>
  );
}
