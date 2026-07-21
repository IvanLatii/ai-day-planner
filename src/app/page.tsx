"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTasks } from "@/lib/tasks/useTasks";
import { TodayTaskCard } from "@/components/TaskCard";
import { EmptyState } from "@/components/EmptyState";
import { UndoToast } from "@/components/UndoToast";
import { formatTodayFull } from "@/lib/tasks/format";
import { sortTodayByTime } from "@/lib/tasks/sort";
import { PAGE_HEADING_CLASS } from "@/lib/ui";
import type { Task } from "@/lib/tasks/types";

const TOAST_DURATION_MS = 4000;
const SORT_MODE_KEY = "ai-day-planner:today-sort";
type SortMode = "priority" | "time";

const SORT_LABEL: Record<SortMode, string> = {
  priority: "Пріоритет",
  time: "Час",
};

const SORT_OPTION_LABEL: Record<SortMode, string> = {
  priority: "За пріоритетом",
  time: "За часом",
};

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

// Todoist-style compact trigger + dropdown instead of two always-visible
// pills — same state/localStorage/sort result, just how it's opened. Also
// sidesteps the width risk of two wide segments sharing a row with H1.
function SortModeToggle({
  mode,
  onChange,
}: {
  mode: SortMode;
  onChange: (mode: SortMode) => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-9 w-[132px] items-center justify-between rounded-md bg-zinc-100 px-3 text-xs font-medium text-zinc-600 active:scale-95 dark:bg-zinc-800 dark:text-zinc-300"
      >
        {SORT_LABEL[mode]}
        <ChevronDownIcon />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-md bg-white py-1 shadow-lg ring-1 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700">
            {(["priority", "time"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  onChange(value);
                  setOpen(false);
                }}
                className="flex min-h-11 w-full items-center justify-between px-3 text-left text-sm text-zinc-700 active:bg-zinc-100 dark:text-zinc-200 dark:active:bg-zinc-700"
              >
                {SORT_OPTION_LABEL[value]}
                {mode === value && <CheckIcon />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function TodayPage() {
  const { isLoaded, inboxTasks, todayTasks, toggleDone } = useTasks();
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
        {doneToast && <UndoToast message="Виконано" onUndo={handleUndo} />}
      </>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h1 className={PAGE_HEADING_CLASS}>Сьогодні</h1>
          <SortModeToggle mode={sortMode} onChange={handleSortChange} />
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{formatTodayFull()}</p>
      </div>
      <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
        {(sortMode === "time" ? sortTodayByTime(todayTasks) : todayTasks).map((task) => (
          <TodayTaskCard key={task.id} task={task} onDone={handleDone} />
        ))}
      </div>
      {doneToast && <UndoToast message="Виконано" onUndo={handleUndo} />}
    </div>
  );
}
