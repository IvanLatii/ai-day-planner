import Link from "next/link";
import { InboxIcon, TodayIcon } from "./icons";
import { PAGE_HEADING_CLASS } from "@/lib/ui";

type Variant = "today-new" | "today-has-inbox" | "inbox-empty";

const CONTENT: Record<
  Variant,
  {
    icon: React.ReactNode;
    title: string;
    body: string;
    ctaLabel: string;
    ctaHref: string;
  }
> = {
  "today-new": {
    icon: <TodayIcon className="h-8 w-8" />,
    title: "Ще нічого немає",
    body: "Скинь усе, що в голові — AI розбере на задачі.",
    ctaLabel: "Записати",
    ctaHref: "/capture",
  },
  "today-has-inbox": {
    icon: <InboxIcon className="h-8 w-8" />,
    title: "У Вхідних є задачі",
    body: "Переглянь і підтверди — вони стануть планом на сьогодні.",
    ctaLabel: "Перейти у Вхідні",
    ctaHref: "/inbox",
  },
  "inbox-empty": {
    icon: <InboxIcon className="h-8 w-8" />,
    title: "Вхідні порожні",
    body: "Скинь усе, що в голові — AI розбере на задачі.",
    ctaLabel: "Записати",
    ctaHref: "/capture",
  },
};

export function EmptyState({ variant }: { variant: Variant }) {
  const { icon, title, body, ctaLabel, ctaHref } = CONTENT[variant];
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
      <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
        {icon}
      </div>
      <h2 className={`mb-1 ${PAGE_HEADING_CLASS}`}>{title}</h2>
      <p className="mb-5 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">{body}</p>
      <Link
        href={ctaHref}
        className="flex min-h-11 items-center justify-center rounded-md bg-zinc-900 px-6 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
