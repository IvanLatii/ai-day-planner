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

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
    </svg>
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

function ClearIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export default function CapturePage() {
  const { addFromCapture } = useTasks();
  const router = useRouter();
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

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

  function handleClear() {
    setText("");
    setStatus("idle");
    setError(null);
  }

  async function handleSubmit() {
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

  function handleSubmitClick() {
    if (status === "loading") return;

    if (text.trim().length === 0) {
      setShake(true);
      setToast("Спершу напиши щось");
      navigator.vibrate?.(150);
      window.setTimeout(() => setShake(false), 400);
      window.setTimeout(() => setToast(null), 2000);
      return;
    }

    handleSubmit();
  }

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex min-h-11 w-fit items-center gap-1 text-sm font-medium text-zinc-500 dark:text-zinc-400"
      >
        <BackIcon />
        Назад
      </button>

      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Що в голові?
      </h1>

      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (status === "error") setStatus("idle");
        }}
        placeholder="наприклад: подзвонити бухгалтеру, купити молоко, до стоматолога на тижні..."
        autoFocus
        className="min-h-[35vh] flex-1 resize-none rounded-2xl border border-zinc-200 bg-white p-4 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
      />

      {(voiceSupported || text.length > 0) && (
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {listening && (
              <>
                <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
                Слухаю…
              </>
            )}
          </span>

          <div className="flex items-center gap-2">
            {listening ? (
              <button
                type="button"
                onClick={stopVoice}
                aria-label="Зупинити диктування"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-white shadow-sm active:scale-95 dark:bg-zinc-300 dark:text-zinc-900"
              >
                <StopIcon />
              </button>
            ) : (
              <>
                {text.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClear}
                    aria-label="Очистити поле"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 shadow-sm active:scale-95 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    <ClearIcon />
                  </button>
                )}
                {voiceSupported && (
                  <button
                    type="button"
                    onClick={startVoice}
                    aria-label="Диктувати голосом"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white shadow-sm active:scale-95 dark:bg-zinc-50 dark:text-zinc-900"
                  >
                    <MicIcon />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {voiceError && (
        <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          {voiceErrorMessage(voiceError)}{" "}
          {/* TEMPORARY DIAGNOSTIC (2026-07-20): remove once we know the real
              failure mode on iPhone Safari. */}
          <span className="opacity-70">Помилка: {voiceError}</span>
        </div>
      )}

      {status === "error" && error && (
        <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          {error}
        </div>
      )}

      {toast && (
        <div className="flex justify-center">
          <span className="rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg dark:bg-zinc-50 dark:text-zinc-900">
            {toast}
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmitClick}
        className={`mb-6 min-h-11 w-full rounded-full bg-zinc-900 text-sm font-semibold text-white dark:bg-zinc-50 dark:text-zinc-900 ${
          shake ? "animate-shake" : ""
        }`}
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
