"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTasks } from "@/lib/tasks/useTasks";
import { FIELD_CLASS, TagEditor } from "@/components/TaskCard";
import { PriorityField } from "@/components/PriorityChip";
import { UndoToast } from "@/components/UndoToast";
import { capitalize } from "@/lib/tasks/format";
import { DETAIL_TITLE_CLASS } from "@/lib/ui";
import type { Task } from "@/lib/tasks/types";

// Shorter than the shared 4000ms elsewhere: this is the only toast that
// also gates a navigation away from the current screen (to origin, see
// handleDeleteClick below) — 4s of standing on a dead task's screen read
// as sluggish. Other toasts (Виконано, Перенесено, Вхідні очищено) don't
// navigate anywhere, so their 4000ms stays untouched.
const TOAST_DURATION_MS = 2000;

const BACK_BUTTON_CLASS =
  "flex min-h-11 w-fit items-center gap-1.5 self-start rounded-md bg-zinc-100 px-6 text-sm font-medium text-zinc-600 active:scale-95 dark:bg-zinc-800 dark:text-zinc-300";

const OUTLINE_BUTTON_CLASS =
  "mt-auto flex h-14 items-center justify-center gap-2 rounded-md border-2 border-zinc-900 text-sm font-medium text-zinc-900 active:scale-95 dark:border-zinc-50 dark:text-zinc-50";

function resizeToFit(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

// Plain <input> can't wrap, so a long title just runs off-screen. A
// single-row textarea that grows with content wraps like the old <h1>
// did, while still behaving as a tap-to-edit field (Todoist-style).
function EditableTitle({
  value,
  onCommit,
}: {
  value: string;
  onCommit: (value: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  return (
    <textarea
      ref={(el) => {
        ref.current = el;
        if (el) resizeToFit(el);
      }}
      defaultValue={value}
      onInput={(e) => resizeToFit(e.currentTarget)}
      onBlur={(e) => onCommit(e.target.value)}
      rows={1}
      aria-label="Назва задачі"
      className={`min-w-0 flex-1 resize-none overflow-hidden border-none bg-transparent p-0 outline-none focus:ring-0 ${DETAIL_TITLE_CLASS}`}
    />
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14 4 9l5-5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
    </svg>
  );
}

function ForwardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-4 w-4 text-white dark:text-zinc-900">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

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

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const {
    isLoaded,
    getTask,
    toggleDone,
    returnToInbox,
    moveToToday,
    cyclePriority,
    updateTask,
    deleteTask,
    restoreTask,
  } = useTasks();
  const [deletedToast, setDeletedToast] = useState<Task | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  if (!isLoaded) return null;

  // Right after delete, getTask(id) returns undefined — deletedToast keeps
  // the last-known task on screen for the length of the undo window instead
  // of falling through to the "not found" state.
  const task = deletedToast ?? getTask(id);

  if (!task) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Задачу не знайдено.</p>
        <button type="button" onClick={() => router.back()} className={BACK_BUTTON_CLASS}>
          <BackIcon />
          Назад
        </button>
      </div>
    );
  }

  const showCheckbox = task.status !== "inbox";
  const isDone = task.status === "done";
  const hasQuote = task.source_text && task.source_text !== task.title;

  function handleDeleteClick() {
    if (!task) return;
    setDeletedToast(task);
    deleteTask(task.id);
    toastTimerRef.current = window.setTimeout(() => {
      setDeletedToast(null);
      router.push("/");
    }, TOAST_DURATION_MS);
  }

  function handleUndoDelete() {
    if (!deletedToast) return;
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    restoreTask(deletedToast);
    setDeletedToast(null);
  }

  return (
    <div className="flex flex-1 flex-col px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6">
      <button type="button" onClick={() => router.back()} className={`${BACK_BUTTON_CLASS} mb-4`}>
        <BackIcon />
        Назад
      </button>

      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <EditableTitle
              value={capitalize(task.title)}
              onCommit={(title) => updateTask(task.id, { title })}
            />
            {showCheckbox && (
              <button
                type="button"
                onClick={() => toggleDone(task.id)}
                aria-label={isDone ? "Скасувати виконання" : "Позначити виконаною"}
                className="-mr-2 mt-1 flex min-h-11 min-w-11 shrink-0 items-center justify-center"
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${
                    isDone
                      ? "border-zinc-900 bg-zinc-900 dark:border-zinc-50 dark:bg-zinc-50"
                      : "border-zinc-300 dark:border-zinc-600"
                  }`}
                >
                  {isDone && <CheckIcon />}
                </span>
              </button>
            )}
          </div>

          {hasQuote && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Оригінальний запис: {task.source_text}
            </p>
          )}
        </div>

        <div className="space-y-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <div className="text-xs text-zinc-500">
            Пріоритет
            <div className="mt-1">
              <PriorityField
                priority={task.priority}
                onClick={() => cyclePriority(task.id)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <label className="block min-w-0 flex-1 text-xs text-zinc-500">
              Дедлайн
              <input
                type="date"
                defaultValue={task.due_date ?? ""}
                onChange={(e) =>
                  updateTask(task.id, { due_date: e.target.value || undefined })
                }
                className={`${FIELD_CLASS} appearance-none [color-scheme:light] dark:[color-scheme:dark]`}
              />
            </label>
            <label className="block min-w-0 flex-1 text-xs text-zinc-500">
              Хвилин
              <input
                type="number"
                min={0}
                placeholder="напр. 30"
                defaultValue={task.time_estimate_min ?? ""}
                onBlur={(e) =>
                  updateTask(task.id, {
                    time_estimate_min: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                className={`${FIELD_CLASS} appearance-none`}
              />
            </label>
          </div>
          <div className="text-xs text-zinc-500">
            Теги
            <div className="mt-1">
              <TagEditor
                tags={task.tags}
                onChange={(tags) => updateTask(task.id, { tags })}
              />
            </div>
          </div>
        </div>

        {task.status === "today" && (
          <button
            type="button"
            onClick={() => returnToInbox(task.id)}
            className={OUTLINE_BUTTON_CLASS}
          >
            <ReturnIcon />
            Повернути у Вхідні
          </button>
        )}

        {task.status === "inbox" && (
          <button
            type="button"
            onClick={() => {
              moveToToday(task.id);
              router.push("/");
            }}
            className={OUTLINE_BUTTON_CLASS}
          >
            <ForwardIcon />
            Перенести у Сьогодні
          </button>
        )}

        <button
          type="button"
          onClick={handleDeleteClick}
          disabled={!!deletedToast}
          className={`flex min-h-11 items-center justify-center gap-2 rounded-md text-sm font-medium text-rose-500 active:scale-95 disabled:opacity-40 ${
            task.status === "done" ? "mt-auto" : ""
          }`}
        >
          <TrashIcon />
          Видалити задачу
        </button>
      </div>

      {deletedToast && <UndoToast message="Задачу видалено" onUndo={handleUndoDelete} />}
    </div>
  );
}
