# Voice Input (Web Speech API) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a microphone button to the Capture screen that dictates into the same
textarea via the Web Speech API (`webkitSpeechRecognition`), with no fallback path
(deferred until real iPhone Safari testing shows one is needed).

**Architecture:** All browser-API logic lives in one hook, `useVoiceDictation`
(`src/lib/voice/useVoiceDictation.ts`), which exposes `{ supported, listening, start,
stop, error }`. `capture/page.tsx` only calls `start`/`stop` and renders the button —
it never touches `SpeechRecognition` directly. This keeps the door open for a future
MediaRecorder fallback to slot in behind the same interface without touching the page.

**Tech Stack:** Next.js App Router, TypeScript (strict), React hooks, Tailwind. No
test framework exists in this repo (no jest/vitest) — see Global Constraints.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-20-voice-input-web-speech-design.md`
- Recognition language fixed to `uk-UA` (not configurable, not auto-detected).
- Voice dictation **appends** to existing textarea content, never replaces it.
- If `SpeechRecognition`/`webkitSpeechRecognition` is unsupported, the mic button
  does not render at all (no disabled state) — text input stays the only path.
- No MediaRecorder/Gemini-transcription fallback in this plan — explicitly out of
  scope until real iPhone Safari testing (spec's "Явно поза скоупом").
- No test framework exists in this repo. `SpeechRecognition` is a browser-only API
  with no meaningful jsdom polyfill, so verification here is: `npx tsc --noEmit`,
  `npm run lint`, and manual interaction via the running dev server (this project's
  established testing approach per `CLAUDE.md` — build first, verify by using it).
- Tap targets ≥44px (mobile-first, one-hand use — project-wide rule).
- `/api/parse-tasks`, `prompt.ts`, and the Inbox/Today chain are not touched.

---

### Task 1: Web Speech ambient types + `useVoiceDictation` hook

**Files:**
- Create: `src/lib/voice/speech-recognition.d.ts`
- Create: `src/lib/voice/useVoiceDictation.ts`

**Interfaces:**
- Produces: `useVoiceDictation(options: { onTranscript: (text: string) => void }): { supported: boolean; listening: boolean; start: () => void; stop: () => void; error: string | null }`
- Produces (ambient globals, no import needed): `SpeechRecognition`, `SpeechRecognitionEvent`, `SpeechRecognitionErrorEvent`, `SpeechRecognitionConstructor`, and `Window.SpeechRecognition` / `Window.webkitSpeechRecognition`.

TypeScript's default DOM lib does not include Web Speech API types, so we declare
them ourselves. There's no way to unit-test a browser-only API in this repo (no
jsdom polyfill, no test framework) — verification for this task is limited to
type-checking and lint; behavioral verification happens in Task 2 once it's wired
into a page you can click.

- [ ] **Step 1: Create the ambient type declarations**

`src/lib/voice/speech-recognition.d.ts`:

```typescript
export {};

declare global {
  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }

  interface SpeechRecognitionResult {
    readonly length: number;
    readonly isFinal: boolean;
    [index: number]: SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionResultList {
    readonly length: number;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
  }

  interface SpeechRecognition extends EventTarget {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    start: () => void;
    stop: () => void;
    abort: () => void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
  }

  interface SpeechRecognitionConstructor {
    new (): SpeechRecognition;
  }

  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}
```

- [ ] **Step 2: Create the hook**

`src/lib/voice/useVoiceDictation.ts`:

```typescript
"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

export interface UseVoiceDictationOptions {
  onTranscript: (text: string) => void;
}

export interface UseVoiceDictationResult {
  supported: boolean;
  listening: boolean;
  start: () => void;
  stop: () => void;
  error: string | null;
}

// Errors that just mean "nothing was said" — not worth surfacing to the user.
const SILENT_ERRORS = new Set(["no-speech"]);

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

// Browser support never changes after load, so subscribe is a no-op — this
// only exists to give the server a stable snapshot (false) that differs from
// the client's real one without React flagging a hydration mismatch.
function subscribeToSupport() {
  return () => {};
}
function getSupportSnapshot(): boolean {
  return getSpeechRecognitionCtor() !== null;
}
function getServerSupportSnapshot(): boolean {
  return false;
}

export function useVoiceDictation({
  onTranscript,
}: UseVoiceDictationOptions): UseVoiceDictationResult {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supported = useSyncExternalStore(
    subscribeToSupport,
    getSupportSnapshot,
    getServerSupportSnapshot
  );
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    setError(null);
    const recognition = new Ctor();
    recognition.lang = "uk-UA";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          onTranscript(result[0].transcript.trim());
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (!SILENT_ERRORS.has(event.error)) {
        setError(event.error);
      }
      setListening(false);
    };

    // Fires on explicit stop() AND when the browser silently ends recognition on
    // its own (common on iOS even with continuous:true) — both cases must drop
    // us back to idle, or the mic button gets stuck showing "Слухаю…".
    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [onTranscript]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  return { supported, listening, start, stop, error };
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: no errors in the two new files.

- [ ] **Step 5: Commit**

```bash
git add src/lib/voice/speech-recognition.d.ts src/lib/voice/useVoiceDictation.ts
git commit -m "Add Web Speech ambient types and useVoiceDictation hook"
```

---

### Task 2: Wire the mic button into the Capture screen

**Files:**
- Modify: `src/app/capture/page.tsx` (full file, shown below)

**Interfaces:**
- Consumes: `useVoiceDictation` from `@/lib/voice/useVoiceDictation` (Task 1) —
  exact signature `{ supported, listening, start, stop, error }`.

This is the task with an actual test cycle: once the button is wired up, it's
clickable in the running dev server. Manual verification (below) replaces
automated tests since none exist in this repo and `SpeechRecognition` can't be
polyfilled meaningfully in jsdom.

- [ ] **Step 1: Replace `src/app/capture/page.tsx` with:**

```typescript
"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useTasks } from "@/lib/tasks/useTasks";
import { useVoiceDictation } from "@/lib/voice/useVoiceDictation";

const ERROR_MESSAGES: Record<string, string> = {
  missing_api_key: "AI тимчасово недоступний (немає ключа). Спробуй пізніше.",
  network_error: "Немає з'єднання з AI. Перевір інтернет і спробуй ще раз.",
  empty_response: "AI не відповів. Спробуй ще раз.",
};

function errorMessage(reason: string): string {
  return ERROR_MESSAGES[reason] ?? "Не вдалося розібрати. Спробуй ще раз.";
}

const VOICE_ERROR_MESSAGES: Record<string, string> = {
  "not-allowed": "Немає доступу до мікрофона. Дозволь доступ у налаштуваннях браузера.",
  "audio-capture": "Мікрофон недоступний. Перевір пристрій і спробуй ще раз.",
  network: "Немає з'єднання для розпізнавання голосу. Спробуй ще раз.",
};

function voiceErrorMessage(reason: string): string {
  return (
    VOICE_ERROR_MESSAGES[reason] ??
    "Не вдалося розпізнати голос. Спробуй ще раз або допиши текстом."
  );
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
      />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

export default function CapturePage() {
  const { addFromCapture } = useTasks();
  const router = useRouter();
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleTranscript = useCallback((chunk: string) => {
    setText((prev) => (prev ? `${prev} ${chunk}` : chunk));
    setStatus((s) => (s === "error" ? "idle" : s));
  }, []);

  const {
    supported: voiceSupported,
    listening,
    start: startVoice,
    stop: stopVoice,
    error: voiceError,
  } = useVoiceDictation({ onTranscript: handleTranscript });

  const canSubmit = text.trim().length > 0 && status !== "loading";

  async function handleSubmit() {
    if (!canSubmit) return;
    setStatus("loading");
    setError(null);

    const result = await addFromCapture(text);

    if (result.ok) {
      setText("");
      setStatus("idle");
      router.push("/inbox");
    } else {
      setStatus("error");
      setError(errorMessage(result.reason));
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-6">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Що в голові?
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Пиши все підряд, як думається — сьогодні, на тиждень, будь-коли. AI
        розбере на задачі.
      </p>

      <div className="relative flex flex-1 flex-col">
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder="напр.: терміново подзвонити бухгалтеру до обіду, купити молоко, десь на тижні до стоматолога..."
          autoFocus
          className="min-h-[35vh] flex-1 resize-none rounded-2xl border border-zinc-200 bg-white p-4 pr-16 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
        />

        {voiceSupported && (
          <div className="absolute right-3 top-3 flex items-center gap-2">
            {listening ? (
              <>
                <span className="flex items-center gap-1.5 rounded-full bg-zinc-900/90 px-2.5 py-1 text-xs font-medium text-white dark:bg-zinc-50/90 dark:text-zinc-900">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
                  Слухаю…
                </span>
                <button
                  type="button"
                  onClick={stopVoice}
                  aria-label="Зупинити диктування"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-600 text-white shadow-sm active:scale-95"
                >
                  <StopIcon />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={startVoice}
                aria-label="Диктувати голосом"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 shadow-sm active:scale-95 dark:bg-zinc-800 dark:text-zinc-300"
              >
                <MicIcon />
              </button>
            )}
          </div>
        )}
      </div>

      {voiceError && (
        <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          {voiceErrorMessage(voiceError)}
        </div>
      )}

      {status === "error" && error && (
        <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="min-h-11 w-full rounded-full bg-zinc-900 text-sm font-semibold text-white transition-opacity disabled:opacity-40 dark:bg-zinc-50 dark:text-zinc-900"
      >
        {status === "loading"
          ? "Розбираю..."
          : status === "error"
            ? "Спробувати ще раз"
            : "Розібрати на задачі"}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Manual verification in the running dev server**

The dev server (`ai-planner-dev`, port 3000) should already be running from
earlier in this session — if not, start it (see project's `.claude/launch.json`).
Using the browser preview tool:

1. Navigate to `http://localhost:3000/capture`.
2. `read_page` and confirm a button with `aria-label="Диктувати голосом"` is
   present (desktop Chrome supports `webkitSpeechRecognition`, so it should
   render).
3. Click it. The browser will prompt for microphone permission — grant it.
   Confirm the button is replaced by the "● Слухаю…" pill + a stop button
   (`aria-label="Зупинити диктування"`).
4. Say something (or, if audio input isn't available in this environment, at
   minimum confirm no console errors appear and the listening state is
   visually correct via screenshot).
5. Click the stop button. Confirm it reverts to the mic button and the
   textarea's `value` includes any recognized speech (`read_page` or
   `get_page_text` on the textarea).
6. In the browser console (`javascript_tool`), run
   `window.webkitSpeechRecognition = undefined; window.SpeechRecognition = undefined;`
   then reload the page. Confirm the mic button is now **absent** entirely
   (not disabled — per the spec's explicit "hide, don't disable" requirement).
7. Take a screenshot of the idle and listening states for the record.

- [ ] **Step 5: Commit**

```bash
git add src/app/capture/page.tsx
git commit -m "Add voice dictation button to Capture screen"
```

---

## Self-Review Notes

- **Spec coverage:** feature-detect + hide (spec ✓ Task 2 step 6), append not
  replace (spec ✓ `handleTranscript`), `uk-UA` fixed (spec ✓ hook), listening
  indicator + stop button in the same slot (spec ✓ Task 2 markup), silent
  `no-speech` vs surfaced errors (spec ✓ `SILENT_ERRORS`), `onend` always
  resolving to idle (spec ✓ hook), no changes to `/api/parse-tasks` / `prompt.ts`
  / Inbox-Today chain (✓ — Task 2 only touches `capture/page.tsx`), MediaRecorder
  fallback explicitly excluded (✓ — not present anywhere in this plan).
- **Placeholder scan:** none found — every step has real code or a real command.
- **Type consistency:** `useVoiceDictation`'s returned shape
  (`supported`/`listening`/`start`/`stop`/`error`) matches its usage in
  `capture/page.tsx` exactly (renamed via destructuring aliases, not new names).
