export function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatDueDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat("uk-UA", {
    day: "numeric",
    month: "short",
  }).format(date);
}

// e.g. "21 липня, вівторок" — full month name, lowercase weekday (reads as
// one continuous phrase, not two separated labels).
export function formatTodayFull(date: Date = new Date()): string {
  const datePart = new Intl.DateTimeFormat("uk-UA", {
    day: "numeric",
    month: "long",
  }).format(date);
  const weekday = new Intl.DateTimeFormat("uk-UA", { weekday: "long" }).format(date);
  return `${datePart}, ${weekday}`;
}

function todayISODate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isOverdue(dueDateIso: string): boolean {
  return dueDateIso < todayISODate();
}

export function formatTimeEstimate(min: number): string {
  if (min < 60) return `${min} хв`;
  const h = Math.floor(min / 60);
  const rest = min % 60;
  return rest === 0 ? `${h} год` : `${h} год ${rest} хв`;
}
