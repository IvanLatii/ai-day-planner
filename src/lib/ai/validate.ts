import type { ParsedFragment, Priority } from "../tasks/types";
import { buildFallbackFragment } from "../tasks/fallback";

const PRIORITIES: Priority[] = ["low", "medium", "high"];

function isValidFragment(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.title === "string" &&
    v.title.trim().length > 0 &&
    typeof v.priority === "string" &&
    PRIORITIES.includes(v.priority as Priority) &&
    typeof v.source_text === "string"
  );
}

function sanitizeFragment(value: Record<string, unknown>): ParsedFragment {
  const tags = Array.isArray(value.tags)
    ? value.tags.filter((t): t is string => typeof t === "string")
    : [];

  const fragment: ParsedFragment = {
    title: String(value.title).trim(),
    priority: value.priority as Priority,
    tags,
    source_text: String(value.source_text),
  };

  if (typeof value.due_date === "string" && value.due_date.trim()) {
    fragment.due_date = value.due_date.trim();
  }
  if (
    typeof value.time_estimate_min === "number" &&
    Number.isFinite(value.time_estimate_min)
  ) {
    fragment.time_estimate_min = value.time_estimate_min;
  }
  if (value.unparsed === true) {
    fragment.unparsed = true;
  }

  return fragment;
}

// Some models wrap JSON in a ```json ... ``` fence despite instructions not to.
function stripCodeFence(raw: string): string {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenceMatch ? fenceMatch[1] : trimmed;
}

// Always succeeds: broken JSON or a malformed item never throws, it degrades
// to a fallback fragment so the caller can always return ok:true.
export function parseAndValidate(
  raw: string,
  originalText: string
): ParsedFragment[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFence(raw));
  } catch {
    return [buildFallbackFragment(originalText)];
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return [buildFallbackFragment(originalText)];
  }

  return parsed.map((item) => {
    if (isValidFragment(item)) {
      return sanitizeFragment(item);
    }
    const sourceText =
      typeof (item as Record<string, unknown>)?.source_text === "string"
        ? ((item as Record<string, unknown>).source_text as string)
        : JSON.stringify(item);
    return buildFallbackFragment(sourceText);
  });
}
