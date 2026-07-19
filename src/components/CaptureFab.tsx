"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function CaptureFab() {
  const pathname = usePathname();
  if (pathname === "/capture") return null;

  // The Inbox screen has its own fixed "Почати день" bar sitting where the
  // FAB normally floats — push the FAB up so the two never overlap.
  const bottomOffset = pathname === "/inbox" ? "bottom-36" : "bottom-20";

  return (
    <Link
      href="/capture"
      aria-label="Записати нові задачі"
      className={`fixed ${bottomOffset} right-5 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-2xl leading-none text-white shadow-lg dark:bg-zinc-50 dark:text-zinc-900`}
    >
      +
    </Link>
  );
}
