"use client";

import { useParams, useRouter } from "next/navigation";
import { useTasks } from "@/lib/tasks/useTasks";
import { FIELD_CLASS, TagEditor } from "@/components/TaskCard";
import { capitalize } from "@/lib/tasks/format";

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
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

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-4 w-4 text-white dark:text-zinc-900">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isLoaded, getTask, toggleDone, returnToInbox, updateTask } = useTasks();

  if (!isLoaded) return null;

  const task = getTask(id);

  if (!task) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Задачу не знайдено.</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="min-h-11 rounded-xl bg-zinc-100 px-5 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
        >
          Назад
        </button>
      </div>
    );
  }

  const showCheckbox = task.status !== "inbox";
  const isDone = task.status === "done";

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-6">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Назад"
        className="-ml-2.5 flex min-h-11 min-w-11 items-center justify-center self-start rounded-full text-zinc-500 active:scale-95 dark:text-zinc-400"
      >
        <BackIcon />
      </button>

      <div className="flex items-start gap-3">
        {showCheckbox && (
          <button
            type="button"
            onClick={() => toggleDone(task.id)}
            aria-label={isDone ? "Скасувати виконання" : "Позначити виконаною"}
            className="mt-0.5 flex min-h-11 min-w-11 shrink-0 items-center justify-center"
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
        <h1 className="mt-0.5 min-w-0 flex-1 font-heading text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {capitalize(task.title)}
        </h1>
      </div>

      {task.source_text && task.source_text !== task.title && (
        <p className="text-sm italic text-zinc-400 dark:text-zinc-500">
          &ldquo;{task.source_text}&rdquo;
        </p>
      )}

      <div className="space-y-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <label className="block text-xs text-zinc-500">
          Назва
          <input
            type="text"
            defaultValue={task.title}
            onBlur={(e) => updateTask(task.id, { title: e.target.value })}
            className={FIELD_CLASS}
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
              className={`${FIELD_CLASS} appearance-none [color-scheme:light] dark:[color-scheme:dark]`}
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
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-zinc-100 text-sm font-medium text-zinc-600 active:scale-95 dark:bg-zinc-800 dark:text-zinc-300"
        >
          <ReturnIcon />
          Повернути у Вхідні
        </button>
      )}
    </div>
  );
}
