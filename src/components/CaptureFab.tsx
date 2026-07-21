"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTasks } from "@/lib/tasks/useTasks";

export function CaptureFabButton({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/capture"
      aria-label="Записати нові задачі"
      className={`pointer-events-auto flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full bg-zinc-900 text-3xl leading-none text-white shadow-lg dark:bg-zinc-50 dark:text-zinc-900 ${className}`}
    >
      +
    </Link>
  );
}

export function CaptureFab() {
  const pathname = usePathname();
  const { inboxTasks } = useTasks();

  if (pathname === "/capture" || pathname.startsWith("/task/")) return null;
  // Inbox-with-tasks renders its own stacked FAB above the confirm button instead.
  if (pathname === "/inbox" && inboxTasks.length > 0) return null;

  return (
    <div className="app-column pointer-events-none fixed inset-x-0 bottom-[calc(68px+env(safe-area-inset-bottom))] z-10 flex justify-end px-6">
      <CaptureFabButton />
    </div>
  );
}
