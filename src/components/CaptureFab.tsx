"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTasks } from "@/lib/tasks/useTasks";

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function CaptureFabButton({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/capture"
      aria-label="Записати задачі"
      className={`pointer-events-auto flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg dark:bg-zinc-50 dark:text-zinc-900 ${className}`}
    >
      <PlusIcon />
    </Link>
  );
}

export function CaptureFab() {
  const pathname = usePathname();
  const { inboxTasks } = useTasks();

  if (pathname === "/capture" || pathname.startsWith("/task/")) return null;
  // Inbox-with-tasks renders its own stacked FAB above the confirm button instead.
  if (pathname === "/" && inboxTasks.length > 0) return null;

  return (
    <div className="app-column pointer-events-none fixed inset-x-0 bottom-[calc(68px+env(safe-area-inset-bottom))] z-10 flex justify-end px-6">
      <CaptureFabButton />
    </div>
  );
}
