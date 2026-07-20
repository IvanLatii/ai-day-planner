"use client";

// TEMPORARY DIAGNOSTIC (2026-07-20): tiny in-memory ring buffer + on-screen
// panel for voice debugging on real devices where Web Inspector isn't handy.
// Remove this whole file (and its usages) once the "no onresult" report is
// diagnosed.

import { useSyncExternalStore } from "react";

const MAX_LINES = 5;
const EMPTY: string[] = [];

let lines: string[] = EMPTY;
const listeners = new Set<() => void>();

function push(text: string) {
  lines = [...lines.slice(-(MAX_LINES - 1)), text];
  listeners.forEach((listener) => listener());
}

function format(args: unknown[]): string {
  return args
    .map((a) => (typeof a === "string" ? a : JSON.stringify(a)))
    .join(" ");
}

export function logVoice(...args: unknown[]): void {
  console.log(...args);
  push(format(args));
}

export function logVoiceError(...args: unknown[]): void {
  console.error(...args);
  push(format(args));
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): string[] {
  return lines;
}

function getServerSnapshot(): string[] {
  return EMPTY;
}

export function useVoiceDebugLog(): string[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
