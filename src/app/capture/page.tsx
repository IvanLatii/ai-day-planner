"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useTasks } from "@/lib/tasks/useTasks";
import { useVoiceDictation } from "@/lib/voice/useVoiceDictation";
import { PAGE_HEADING_CLASS } from "@/lib/ui";

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

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function WaveformIcon() {
  const delays = ["0ms", "150ms", "300ms", "450ms"];
  return (
    <span className="flex h-3 items-end gap-0.5" aria-hidden>
      {delays.map((delay) => (
        <span
          key={delay}
          className="voice-wave-bar h-full w-0.5 rounded-full bg-rose-500"
          style={{ animationDelay: delay }}
        />
      ))}
    </span>
  );
}

// Bigger equalizer that sits directly above the action button while
// recording — distinct from the small inline WaveformIcon next to
// "Слухаю…", which stays where it is.
function EqualizerBar() {
  const delays = ["0ms", "100ms", "200ms", "300ms", "400ms", "300ms", "200ms", "100ms"];
  return (
    <div className="flex h-6 items-end justify-center gap-1" aria-hidden>
      {delays.map((delay, i) => (
        <span
          key={i}
          className="voice-wave-bar h-full w-1 rounded-full bg-rose-500"
          style={{ animationDelay: delay }}
        />
      ))}
    </div>
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
    interimText,
    start: startVoice,
    stop: stopVoice,
    error: voiceError,
  } = useVoiceDictation({ onTranscript: handleTranscript });

  const showInterim = listening && interimText.length > 0;
  const showMergedMicButton = !listening && text.trim().length === 0 && voiceSupported;

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
    <div className="flex flex-1 flex-col gap-4 px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6">
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex min-h-11 w-fit items-center gap-1.5 rounded-md bg-zinc-100 px-6 text-sm font-medium text-zinc-600 active:scale-95 dark:bg-zinc-800 dark:text-zinc-300"
        >
          <BackIcon />
          Назад
        </button>

        <h1 className={PAGE_HEADING_CLASS}>Що в голові?</h1>
      </div>

      <div className="flex flex-1 flex-col">
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder="наприклад: подзвонити бухгалтеру, купити молоко..."
          autoFocus
          className={`min-h-[22vh] flex-1 resize-none border-none bg-zinc-100 p-4 text-base text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-400 dark:focus:ring-zinc-600 ${
            showInterim ? "rounded-t-md" : "rounded-md"
          }`}
        />
        {showInterim && (
          <div
            aria-hidden
            className="rounded-b-md bg-zinc-100 px-4 pb-3 text-base text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
          >
            {interimText}
          </div>
        )}
      </div>

      {(voiceSupported || text.length > 0) && !showMergedMicButton && (
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {listening && (
              <>
                <WaveformIcon />
                Слухаю…
              </>
            )}
          </span>

          <div className="flex items-center gap-2">
            {listening ? (
              <button
                type="button"
                onClick={stopVoice}
                aria-label="Завершити диктування"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-zinc-700 text-white shadow-sm active:scale-95 dark:bg-zinc-300 dark:text-zinc-900"
              >
                <CheckIcon />
              </button>
            ) : (
              <>
                {text.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClear}
                    aria-label="Очистити поле"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-zinc-400 active:scale-95 dark:text-zinc-500"
                  >
                    <ClearIcon />
                  </button>
                )}
                {voiceSupported && (
                  <button
                    type="button"
                    onClick={startVoice}
                    aria-label="Диктувати голосом"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-600 shadow-sm active:scale-95 dark:bg-zinc-800 dark:text-zinc-300"
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
          {voiceErrorMessage(voiceError)}
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

      {listening && (
        <div className="flex justify-center">
          <EqualizerBar />
        </div>
      )}

      {showMergedMicButton ? (
        <button
          type="button"
          onClick={startVoice}
          className="flex h-[68px] w-full items-center justify-center gap-3 rounded-md bg-zinc-900 text-sm font-semibold text-white dark:bg-zinc-50 dark:text-zinc-900"
        >
          <MicIcon />
          Записати задачу
        </button>
      ) : (
        <button
          type="button"
          onClick={handleSubmitClick}
          className={`h-[68px] w-full rounded-md bg-zinc-900 text-sm font-semibold text-white dark:bg-zinc-50 dark:text-zinc-900 ${
            shake ? "animate-shake" : ""
          }`}
        >
          {status === "loading"
            ? "Розбираю..."
            : status === "error"
              ? "Спробувати ще раз"
              : "Розібрати на задачі"}
        </button>
      )}
    </div>
  );
}
