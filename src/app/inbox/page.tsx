"use client";

import { useRouter } from "next/navigation";
import { useTasks } from "@/lib/tasks/useTasks";
import { InboxTaskCard } from "@/components/TaskCard";
import { EmptyState } from "@/components/EmptyState";
import { CaptureFabButton } from "@/components/CaptureFab";
import { PAGE_HEADING_CLASS } from "@/lib/ui";

export default function InboxPage() {
  const { isLoaded, inboxTasks, startDay } = useTasks();
  const router = useRouter();

  if (!isLoaded) return null;

  if (inboxTasks.length === 0) {
    return <EmptyState variant="inbox-empty" />;
  }

  return (
    <div className="flex flex-1 flex-col gap-3 px-6 py-6">
      <h1 className={PAGE_HEADING_CLASS}>Вхідні</h1>
      <div className="flex flex-col divide-y divide-zinc-100 pb-40 dark:divide-zinc-800">
        {inboxTasks.map((task) => (
          <InboxTaskCard key={task.id} task={task} />
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
          className="h-[68px] w-full rounded-md bg-zinc-900 text-sm font-semibold text-white shadow-lg dark:bg-zinc-50 dark:text-zinc-900"
        >
          Підтвердити задачі
        </button>
      </div>
    </div>
  );
}
