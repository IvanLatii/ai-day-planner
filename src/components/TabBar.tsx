"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTasks } from "@/lib/tasks/useTasks";
import { InboxIcon, TodayIcon } from "./icons";

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
    <Link href={href} className="flex h-12 flex-1 items-center p-1.5">
      <span
        className={`flex h-full w-full items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors ${
          active
            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
            : "text-zinc-400 dark:text-zinc-500"
        }`}
      >
        {icon}
        {label}
        {!!badge && badge > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-700 px-1 text-[10px] font-semibold leading-none text-white dark:bg-zinc-300 dark:text-zinc-900">
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

  if (pathname.startsWith("/task/") || pathname === "/capture") return null;

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
