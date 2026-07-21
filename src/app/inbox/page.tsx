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

export default function InboxPage() {
  const { isLoaded, inboxTasks, startDay, returnToInbox } = useTasks();
  const router = useRouter();
  const [movedTask, setMovedTask] = useState<Task | null>(null);
  const toastTimerRef = useRef<number | null>(null);

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

  if (!isLoaded) return null;

  if (inboxTasks.length === 0) {
    return (
      <>
        <EmptyState variant="inbox-empty" />
        {movedTask && <UndoToast message="Перенесено у Сьогодні" onUndo={handleUndoMove} />}
      </>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3 px-6 py-6">
      <h1 className={PAGE_HEADING_CLASS}>Вхідні</h1>
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
            router.push("/");
          }}
          className={`${PRIMARY_BUTTON_CLASS} shadow-lg`}
        >
          Підтвердити задачі
        </button>
      </div>

      {movedTask && <UndoToast message="Перенесено у Сьогодні" onUndo={handleUndoMove} />}
    </div>
  );
}
