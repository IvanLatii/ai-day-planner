"use client";

import type { Priority } from "@/lib/tasks/types";

const LABEL: Record<Priority, string> = {
  high: "Високий",
  medium: "Середній",
  low: "Низький",
};

const STYLE: Record<Priority, string> = {
  high: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  low: "bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300",
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
      className={`min-h-11 shrink-0 rounded-full px-3 text-sm font-medium transition-colors active:scale-95 ${STYLE[priority]}`}
      aria-label={`Пріоритет: ${LABEL[priority]}. Тап, щоб змінити.`}
    >
      {LABEL[priority]}
    </button>
  );
}
