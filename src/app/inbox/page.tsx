"use client";

import { useRouter } from "next/navigation";
import { useTasks } from "@/lib/tasks/useTasks";
import { InboxTaskCard } from "@/components/TaskCard";
import { EmptyState } from "@/components/EmptyState";

export default function InboxPage() {
  const { isLoaded, inboxTasks, startDay } = useTasks();
  const router = useRouter();

  if (!isLoaded) return null;

  if (inboxTasks.length === 0) {
    return <EmptyState variant="inbox-empty" />;
  }

  return (
    <div className="flex flex-1 flex-col gap-3 px-4 py-6">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Вхідні
      </h1>
      <div className="flex flex-col gap-2 pb-20">
        {inboxTasks.map((task) => (
          <InboxTaskCard key={task.id} task={task} />
        ))}
      </div>

      <div className="fixed inset-x-0 bottom-16 z-10 flex justify-center px-4">
        <button
          type="button"
          onClick={() => {
            startDay();
            router.push("/");
          }}
          className="min-h-11 w-full max-w-sm rounded-full bg-zinc-900 text-sm font-semibold text-white shadow-lg dark:bg-zinc-50 dark:text-zinc-900"
        >
          Почати день
        </button>
      </div>
    </div>
  );
}
