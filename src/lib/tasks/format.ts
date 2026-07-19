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
