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
