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

export function formatTimeEstimate(min: number): string {
  if (min < 60) return `${min} хв`;
  const h = Math.floor(min / 60);
  const rest = min % 60;
  return rest === 0 ? `${h} год` : `${h} год ${rest} хв`;
}

// Ukrainian plural: 11-14 always genitive plural regardless of last digit.
export function pluralizeTasks(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return "задач";
  if (mod10 === 1) return "задача";
  if (mod10 >= 2 && mod10 <= 4) return "задачі";
  return "задач";
}
