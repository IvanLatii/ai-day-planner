import { NextResponse } from "next/server";
import { getAIProvider, AIProviderError } from "@/lib/ai";
import { parseAndValidate } from "@/lib/ai/validate";
import type { ParseResult } from "@/lib/tasks/types";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ParseResult>({ ok: false, reason: "bad_request" });
  }

  const text = (body as { text?: unknown })?.text;
  const today = (body as { today?: unknown })?.today;

  if (typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json<ParseResult>({ ok: false, reason: "empty_input" });
  }
  if (typeof today !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(today)) {
    return NextResponse.json<ParseResult>({ ok: false, reason: "bad_request" });
  }

  const provider = getAIProvider();

  let raw: string;
  try {
    raw = await provider.generate(text, today);
  } catch (err) {
    const reason = err instanceof AIProviderError ? err.message : "unknown_error";
    return NextResponse.json<ParseResult>({ ok: false, reason });
  }

  const fragments = parseAndValidate(raw, text);
  return NextResponse.json<ParseResult>({ ok: true, fragments });
}
