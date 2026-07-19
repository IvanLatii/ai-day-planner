"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTasks } from "@/lib/tasks/useTasks";

function TabLink({
  href,
  label,
  active,
  badge,
}: {
  href: string;
  label: string;
  active: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className={`relative flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 text-sm font-medium ${
        active
          ? "text-zinc-900 dark:text-zinc-50"
          : "text-zinc-400 dark:text-zinc-500"
      }`}
    >
      {label}
      {!!badge && badge > 0 && (
        <span className="absolute right-1/3 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
          {badge}
        </span>
      )}
    </Link>
  );
}

export function TabBar() {
  const pathname = usePathname();
  const { inboxTasks } = useTasks();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-zinc-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
      <TabLink href="/" label="Сьогодні" active={pathname === "/"} />
      <TabLink
        href="/inbox"
        label="Вхідні"
        active={pathname === "/inbox"}
        badge={inboxTasks.length}
      />
    </nav>
  );
}
