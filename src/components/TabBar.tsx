"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTasks } from "@/lib/tasks/useTasks";
import { InboxIcon, TodayIcon } from "./icons";

type Accent = "amber" | "blue";

const ACTIVE_ACCENT_STYLE: Record<Accent, string> = {
  amber: "bg-amber-500/15 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  blue: "bg-blue-500/15 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
};

function TabLink({
  href,
  label,
  icon,
  active,
  accent,
  badge,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  accent: Accent;
  badge?: number;
}) {
  return (
    <Link href={href} className="flex h-12 flex-1 items-center p-1.5">
      <span
        className={`flex h-full w-full items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors ${
          active ? ACTIVE_ACCENT_STYLE[accent] : "text-zinc-400 dark:text-zinc-500"
        }`}
      >
        {icon}
        {label}
        {!!badge && badge > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold leading-none text-white">
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
        accent="amber"
        badge={inboxTasks.length}
      />
      <TabLink
        href="/"
        label="Сьогодні"
        icon={<TodayIcon />}
        active={pathname === "/"}
        accent="blue"
      />
    </nav>
  );
}
