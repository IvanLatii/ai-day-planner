"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTasks } from "@/lib/tasks/useTasks";
import { useVoiceDictation } from "@/lib/voice/useVoiceDictation";
import { PAGE_HEADING_CLASS, PRIMARY_BUTTON_CLASS } from "@/lib/ui";

const ERROR_MESSAGES: Record<string, string> = {
  missing_api_key: "ШІ тимчасово недоступний (немає ключа). Спробуй пізніше.",
  network_error: "Немає з'єднання з ШІ. Перевір інтернет і спробуй ще раз.",
  empty_response: "ШІ не відповів. Спробуй ще раз.",
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

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18.5 14.5l.6 1.7 1.7.6-1.7.6-.6 1.7-.6-1.7-1.7-.6 1.7-.6.6-1.7Z"
      />
    </svg>
  );
}

// Sized to roughly match the cap-height of the "Слухаю…" label next to
// it (~14-16px) so it reads as an inline indicator, not a dominant shape.
function WaveformIcon() {
  const delays = ["0ms", "150ms", "300ms", "450ms"];
  return (
    <span className="flex h-4 items-end gap-1" aria-hidden>
      {delays.map((delay) => (
        <span
          key={delay}
          className="voice-wave-bar h-full w-1 rounded-full bg-rose-500"
          style={{ animationDelay: delay }}
        />
      ))}
    </span>
  );
}

function LoadingDots() {
  const delays = ["0ms", "200ms", "400ms"];
  return (
    <span className="flex items-center gap-1" aria-hidden>
      {delays.map((delay) => (
        <span
          key={delay}
          className="pulse-dot h-1.5 w-1.5 rounded-full bg-white dark:bg-zinc-900"
          style={{ animationDelay: delay }}
        />
      ))}
    </span>
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
  const recordingSnapshotRef = useRef("");

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

  function handleStartRecording() {
    recordingSnapshotRef.current = text;
    startVoice();
  }

  function handleCancelRecording() {
    stopVoice();
    setText(recordingSnapshotRef.current);
  }

  function handleConfirmRecording() {
    stopVoice();
  }

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
      router.push("/");
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

      {listening && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            <WaveformIcon />
            Слухаю…
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCancelRecording}
              className="flex h-11 items-center justify-center rounded-md bg-zinc-100 px-6 text-sm font-medium text-zinc-700 active:scale-95 dark:bg-zinc-800 dark:text-zinc-300"
            >
              Скасувати
            </button>
            <button
              type="button"
              onClick={handleConfirmRecording}
              className="flex h-11 items-center justify-center rounded-md bg-zinc-100 px-6 text-sm font-medium text-zinc-700 active:scale-95 dark:bg-zinc-800 dark:text-zinc-300"
            >
              Підтвердити
            </button>
          </div>
        </div>
      )}

      {!listening && !showMergedMicButton && (text.length > 0 || voiceSupported) && (
        <div className={`grid gap-2 ${text.length > 0 ? "grid-cols-2" : "grid-cols-1"}`}>
          {text.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="flex h-11 items-center justify-center gap-1.5 rounded-md bg-zinc-100 px-6 text-sm font-medium text-zinc-600 active:scale-95 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <ClearIcon />
              Очистити
            </button>
          )}
          {voiceSupported && (
            <button
              type="button"
              onClick={handleStartRecording}
              className="flex h-11 items-center justify-center gap-1.5 rounded-md bg-zinc-100 px-6 text-sm font-medium text-zinc-600 active:scale-95 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <MicIcon />
              Диктувати
            </button>
          )}
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

      {listening ? null : showMergedMicButton ? (
        <button
          type="button"
          onClick={handleStartRecording}
          className={`${PRIMARY_BUTTON_CLASS} mt-4`}
        >
          <MicIcon />
          Записати задачі
        </button>
      ) : (
        <button
          type="button"
          onClick={handleSubmitClick}
          className={`${PRIMARY_BUTTON_CLASS} mt-4 ${shake ? "animate-shake" : ""}`}
        >
          {status === "loading" ? (
            <>
              Розбираю
              <LoadingDots />
            </>
          ) : status === "error" ? (
            "Спробувати ще раз"
          ) : (
            <>
              <SparkleIcon />
              Розібрати на задачі
            </>
          )}
        </button>
      )}
    </div>
  );
}
