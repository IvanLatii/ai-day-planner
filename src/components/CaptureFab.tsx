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
      className="fixed bottom-20 right-5 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-2xl leading-none text-white shadow-lg dark:bg-zinc-50 dark:text-zinc-900"
    >
      +
    </Link>
  );
}
