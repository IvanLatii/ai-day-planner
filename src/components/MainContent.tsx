"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// Mirrors TabBar's own hide condition — pb-20 exists only to keep content
// clear of the fixed tab bar, so it shouldn't apply where the bar is hidden.
export function MainContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hasTabBar = !(pathname.startsWith("/task/") || pathname === "/capture");

  return (
    <main
      className={`mx-auto flex w-full max-w-[700px] flex-1 flex-col ${hasTabBar ? "pb-20" : ""}`}
    >
      {children}
    </main>
  );
}
