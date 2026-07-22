"use client";

import type { Priority } from "@/lib/tasks/types";

const LABEL: Record<Priority, string> = {
  high: "П1",
  medium: "П2",
  low: "П3",
};

const FULL_LABEL: Record<Priority, string> = {
  high: "Високий",
  medium: "Середній",
  low: "Низький",
};

const DETAIL_LABEL: Record<Priority, string> = {
  high: "Пріоритет 1",
  medium: "Пріоритет 2",
  low: "Пріоритет 3",
};

const STYLE: Record<Priority, string> = {
  high: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  low: "bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300",
};

// Today-list checkbox border color — priority-as-color instead of a chip.
export const PRIORITY_CHECKBOX_BORDER: Record<Priority, string> = {
  high: "border-rose-500 dark:border-rose-400",
  medium: "border-amber-500 dark:border-amber-400",
  low: "border-zinc-300 dark:border-zinc-600",
};

export function PriorityChip({
  priority,
  onClick,
}: {
  priority: Priority;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Пріоритет: ${FULL_LABEL[priority]}. Тап, щоб змінити.`}
      className="flex min-h-11 w-8 shrink-0 items-center justify-center active:scale-95"
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold transition-colors ${STYLE[priority]}`}
      >
        {LABEL[priority]}
      </span>
    </button>
  );
}

// Detail-screen variant: left-aligned with the rest of the fields
// (Дедлайн/Хвилин), not centered in a 44×44 tap-target box like the
// list chip — that box is correct for InboxTaskCard, wrong here.
export function PriorityField({
  priority,
  onClick,
}: {
  priority: Priority;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-11 w-full items-center justify-start rounded-lg px-3 text-sm font-medium transition-colors active:scale-95 ${STYLE[priority]}`}
    >
      {DETAIL_LABEL[priority]}
    </button>
  );
}
