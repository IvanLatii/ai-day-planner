// Shared page-heading style so "Вхідні"/"Сьогодні"/"Що в голові?"/empty
// states all stay the same size as new screens are added.
export const PAGE_HEADING_CLASS =
  "font-heading text-[46px] leading-[1] font-bold text-zinc-900 dark:text-zinc-50";

// Task-detail title: default Geist (not the Alumni Sans heading font),
// sized independently of PAGE_HEADING_CLASS — 34px is a compromise between
// 2x the Today card title (16px) and page-heading−30% (54px → 38px).
export const DETAIL_TITLE_CLASS =
  "font-sans text-[34px] font-semibold leading-[1.1] text-zinc-900 dark:text-zinc-50";

// Головні дії екрана — одна висота на весь застосунок.
export const PRIMARY_BUTTON_CLASS =
  "flex h-14 w-full items-center justify-center gap-2 rounded-md " +
  "bg-zinc-900 text-sm font-semibold text-white dark:bg-zinc-50 dark:text-zinc-900";
