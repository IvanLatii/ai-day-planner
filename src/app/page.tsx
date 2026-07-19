"use client";

import { useTasks } from "@/lib/tasks/useTasks";
import { TodayTaskCard } from "@/components/TaskCard";
import { EmptyState } from "@/components/EmptyState";

export default function TodayPage() {
  const { isLoaded, hasAnyTasks, inboxTasks, todayTasks } = useTasks();

  if (!isLoaded) return null;

  if (todayTasks.length === 0) {
    return (
      <EmptyState variant={inboxTasks.length > 0 ? "today-has-inbox" : "today-new"} />
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3 px-4 py-6">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Сьогодні
      </h1>
      {hasAnyTasks && inboxTasks.length > 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          У Inbox ще {inboxTasks.length} задач{inboxTasks.length === 1 ? "а" : ""}{" "}
          на розгляд.
        </p>
      )}
      <div className="flex flex-col gap-2">
        {todayTasks.map((task) => (
          <TodayTaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
