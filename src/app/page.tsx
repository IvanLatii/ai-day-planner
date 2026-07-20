"use client";

import { useCallback, useRef, useState } from "react";
import { useTasks } from "@/lib/tasks/useTasks";
import { TodayTaskCard } from "@/components/TaskCard";
import { EmptyState } from "@/components/EmptyState";
import { capitalize } from "@/lib/tasks/format";
import type { Task } from "@/lib/tasks/types";

const TOAST_DURATION_MS = 4000;

function DoneToast({ task, onUndo }: { task: Task; onUndo: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-[calc(68px+env(safe-area-inset-bottom))] z-20 flex justify-center px-4">
      <div className="flex max-w-sm items-center gap-3 rounded-xl bg-zinc-900 px-4 py-3 text-sm text-white shadow-lg dark:bg-zinc-50 dark:text-zinc-900">
        <span className="min-w-0 flex-1 truncate">
          Виконано: {capitalize(task.title)}
        </span>
        <button type="button" onClick={onUndo} className="shrink-0 font-semibold underline underline-offset-2">
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
        {doneToast && <DoneToast task={doneToast} onUndo={handleUndo} />}
      </>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3 px-4 py-6">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Сьогодні
      </h1>
      {hasAnyTasks && inboxTasks.length > 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          У Вхідних ще {inboxTasks.length} задач{inboxTasks.length === 1 ? "а" : ""}{" "}
          на розгляд.
        </p>
      )}
      <div className="flex flex-col gap-2">
        {todayTasks.map((task) => (
          <TodayTaskCard key={task.id} task={task} onDone={handleDone} />
        ))}
      </div>
      {doneToast && <DoneToast task={doneToast} onUndo={handleUndo} />}
    </div>
  );
}
