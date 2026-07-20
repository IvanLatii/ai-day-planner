"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTasks } from "@/lib/tasks/useTasks";

function InboxIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h4l2 3h6l2-3h4" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.5 5.5 3 12v6a1.5 1.5 0 0 0 1.5 1.5h15a1.5 1.5 0 0 0 1.5-1.5v-6l-2.5-6.5A1.5 1.5 0 0 0 17.1 4H6.9a1.5 1.5 0 0 0-1.4 1.5Z"
      />
    </svg>
  );
}

function TodayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
      <rect x="3.5" y="4.5" width="17" height="16" rx="2" />
      <path strokeLinecap="round" d="M8 3v3M16 3v3M3.5 9.5h17" />
    </svg>
  );
}

function TabLink({
  href,
  label,
  icon,
  active,
  badge,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  badge?: number;
}) {
  return (
    <Link href={href} className="flex h-14 flex-1 items-center p-1.5">
      <span
        className={`flex h-full w-full items-center justify-center gap-1.5 rounded-md text-sm font-medium transition-colors ${
          active
            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
            : "text-zinc-400 dark:text-zinc-500"
        }`}
      >
        {icon}
        {label}
        {!!badge && badge > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
            {badge}
          </span>
        )}
      </span>
    </Link>
  );
}

export function TabBar() {
  const pathname = usePathname();
  const { inboxTasks } = useTasks();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-zinc-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
      <TabLink
        href="/inbox"
        label="Вхідні"
        icon={<InboxIcon />}
        active={pathname === "/inbox"}
        badge={inboxTasks.length}
      />
      <TabLink href="/" label="Сьогодні" icon={<TodayIcon />} active={pathname === "/"} />
    </nav>
  );
}
