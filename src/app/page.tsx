"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTasks } from "@/lib/tasks/useTasks";
import { InboxTaskCard } from "@/components/TaskCard";
import { EmptyState } from "@/components/EmptyState";
import { CaptureFabButton } from "@/components/CaptureFab";
import { UndoToast } from "@/components/UndoToast";
import { PAGE_HEADING_CLASS, PRIMARY_BUTTON_CLASS } from "@/lib/ui";
import type { Task } from "@/lib/tasks/types";

const TOAST_DURATION_MS = 4000;

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12"
      />
    </svg>
  );
}

export default function InboxPage() {
  const { isLoaded, inboxTasks, startDay, returnToInbox, deleteInboxTasks, restoreTasks } =
    useTasks();
  const router = useRouter();
  const [movedTask, setMovedTask] = useState<Task | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const [clearedTasks, setClearedTasks] = useState<Task[] | null>(null);
  const clearTimerRef = useRef<number | null>(null);

  const handleMove = useCallback((task: Task) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setMovedTask(task);
    toastTimerRef.current = window.setTimeout(() => setMovedTask(null), TOAST_DURATION_MS);
  }, []);

  const handleUndoMove = useCallback(() => {
    if (!movedTask) return;
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    returnToInbox(movedTask.id);
    setMovedTask(null);
  }, [movedTask, returnToInbox]);

  const handleClearInbox = useCallback(() => {
    if (clearTimerRef.current) window.clearTimeout(clearTimerRef.current);
    setClearedTasks(inboxTasks);
    deleteInboxTasks();
    clearTimerRef.current = window.setTimeout(() => setClearedTasks(null), TOAST_DURATION_MS);
  }, [inboxTasks, deleteInboxTasks]);

  const handleUndoClear = useCallback(() => {
    if (!clearedTasks) return;
    if (clearTimerRef.current) window.clearTimeout(clearTimerRef.current);
    restoreTasks(clearedTasks);
    setClearedTasks(null);
  }, [clearedTasks, restoreTasks]);

  if (!isLoaded) return null;

  if (inboxTasks.length === 0) {
    return (
      <>
        <EmptyState variant="inbox-empty" />
        {movedTask && <UndoToast message="Перенесено у Сьогодні" onUndo={handleUndoMove} />}
        {clearedTasks && <UndoToast message="Вхідні очищено" onUndo={handleUndoClear} />}
      </>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3 px-6 py-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className={PAGE_HEADING_CLASS}>Вхідні</h1>
        <button
          type="button"
          onClick={handleClearInbox}
          aria-label="Очистити Вхідні"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-500 active:scale-95 dark:bg-zinc-800 dark:text-zinc-400"
        >
          <TrashIcon />
        </button>
      </div>
      <div className="flex flex-col divide-y divide-zinc-100 pb-40 dark:divide-zinc-800">
        {inboxTasks.map((task) => (
          <InboxTaskCard key={task.id} task={task} onMove={handleMove} />
        ))}
      </div>

      <div className="app-column fixed inset-x-0 bottom-[calc(68px+env(safe-area-inset-bottom))] z-10 flex flex-col items-end gap-3 px-6">
        <CaptureFabButton />
        <button
          type="button"
          onClick={() => {
            startDay();
            router.push("/today");
          }}
          className={`${PRIMARY_BUTTON_CLASS} shadow-lg`}
        >
          Підтвердити задачі
        </button>
      </div>

      {movedTask && <UndoToast message="Перенесено у Сьогодні" onUndo={handleUndoMove} />}
      {clearedTasks && <UndoToast message="Вхідні очищено" onUndo={handleUndoClear} />}
    </div>
  );
}
