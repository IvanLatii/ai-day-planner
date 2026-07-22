import Link from "next/link";
import { InboxIcon, TodayIcon } from "./icons";
import { EMPTY_HEADING_CLASS, PRIMARY_BUTTON_CLASS } from "@/lib/ui";

type Variant = "today-new" | "today-has-inbox" | "inbox-empty";
type Accent = "amber" | "blue";

const ACCENT_STYLE: Record<Accent, string> = {
  amber: "bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400",
  blue: "bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400",
};

const CONTENT: Record<
  Variant,
  {
    icon: React.ReactNode;
    accent: Accent;
    title: string;
    body: string;
    ctaLabel: string;
    ctaHref: string;
  }
> = {
  "today-new": {
    icon: <TodayIcon className="h-8 w-8" />,
    accent: "blue",
    title: "Сьогодні задач немає",
    body: "Запиши все, що в голові — ШІ розбере на задачі.",
    ctaLabel: "Записати задачі",
    ctaHref: "/capture",
  },
  "today-has-inbox": {
    icon: <InboxIcon className="h-8 w-8" />,
    accent: "blue",
    title: "Задачі чекають у Вхідних",
    body: "Переглянь і підтверди — вони стануть планом на сьогодні.",
    ctaLabel: "Перейти у Вхідні",
    ctaHref: "/",
  },
  "inbox-empty": {
    icon: <InboxIcon className="h-8 w-8" />,
    accent: "amber",
    title: "Вхідних задач немає",
    body: "Запиши все, що в голові — ШІ розбере на задачі.",
    ctaLabel: "Записати задачі",
    ctaHref: "/capture",
  },
};

export function EmptyState({ variant }: { variant: Variant }) {
  const { icon, accent, title, body, ctaLabel, ctaHref } = CONTENT[variant];
  return (
    <div className="flex flex-1 flex-col items-center justify-start px-8 pb-16 pt-32 text-center">
      <div
        className={`mb-3 flex h-20 w-20 items-center justify-center rounded-full ${ACCENT_STYLE[accent]}`}
      >
        {icon}
      </div>
      <h2 className={`mb-3 ${EMPTY_HEADING_CLASS}`}>{title}</h2>
      <p className="mb-10 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">{body}</p>
      <Link
        href={ctaHref}
        className={`${PRIMARY_BUTTON_CLASS.replace("w-full", "w-fit")} px-6`}
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
