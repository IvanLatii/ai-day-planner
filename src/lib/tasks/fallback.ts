import type { ParsedFragment } from "./types";

// Used when a fragment came back from the AI malformed or under-specified —
// never invent a priority/date, just preserve the original text and flag it.
export function buildFallbackFragment(sourceText: string): ParsedFragment {
  const trimmed = sourceText.trim();
  return {
    title: trimmed.length > 0 ? trimmed : "Нерозпізнаний фрагмент",
    priority: "medium",
    tags: [],
    source_text: trimmed,
    unparsed: true,
  };
}
