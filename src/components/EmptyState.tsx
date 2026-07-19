import Link from "next/link";

type Variant = "today-new" | "today-has-inbox" | "inbox-empty";

const CONTENT: Record<
  Variant,
  { emoji: string; title: string; body: string; ctaLabel: string; ctaHref: string }
> = {
  "today-new": {
    emoji: "🧠",
    title: "Ще нічого немає",
    body: "Вивали все, що в голові, — AI розбере на задачі за тебе.",
    ctaLabel: "Почати",
    ctaHref: "/capture",
  },
  "today-has-inbox": {
    emoji: "📥",
    title: "У Inbox є задачі",
    body: "Переглянь і підтверди — вони стануть планом на сьогодні.",
    ctaLabel: "Перейти в Inbox",
    ctaHref: "/inbox",
  },
  "inbox-empty": {
    emoji: "✨",
    title: "Inbox порожній",
    body: "Скинь усе, що в голові, текстом — AI розбере на задачі.",
    ctaLabel: "Capture",
    ctaHref: "/capture",
  },
};

export function EmptyState({ variant }: { variant: Variant }) {
  const { emoji, title, body, ctaLabel, ctaHref } = CONTENT[variant];
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 py-16 text-center">
      <span className="text-4xl" aria-hidden>
        {emoji}
      </span>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {title}
      </h2>
      <p className="max-w-xs text-sm text-zinc-500 dark:text-zinc-400">{body}</p>
      <Link
        href={ctaHref}
        className="mt-2 flex min-h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
