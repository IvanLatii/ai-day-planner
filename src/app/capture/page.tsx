"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTasks } from "@/lib/tasks/useTasks";

const ERROR_MESSAGES: Record<string, string> = {
  missing_api_key: "AI тимчасово недоступний (немає ключа). Спробуй пізніше.",
  network_error: "Немає з'єднання з AI. Перевір інтернет і спробуй ще раз.",
  empty_response: "AI не відповів. Спробуй ще раз.",
};

function errorMessage(reason: string): string {
  return ERROR_MESSAGES[reason] ?? "Не вдалося розібрати. Спробуй ще раз.";
}

export default function CapturePage() {
  const { addFromCapture } = useTasks();
  const router = useRouter();
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

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

      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (status === "error") setStatus("idle");
        }}
        placeholder="напр.: терміново подзвонити бухгалтеру до обіду, купити молоко, десь на тижні до стоматолога..."
        autoFocus
        className="min-h-[35vh] flex-1 resize-none rounded-2xl border border-zinc-200 bg-white p-4 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
      />

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
            : "Розібрати"}
      </button>
    </div>
  );
}
