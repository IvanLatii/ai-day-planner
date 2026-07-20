"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function CaptureFab() {
  const pathname = usePathname();
  if (pathname === "/capture") return null;

  return (
    <Link
      href="/capture"
      aria-label="Записати нові задачі"
      className="fixed bottom-[calc(68px+env(safe-area-inset-bottom))] right-5 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-2xl leading-none text-white shadow-lg dark:bg-zinc-50 dark:text-zinc-900"
    >
      +
    </Link>
  );
}
