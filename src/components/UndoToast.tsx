function UndoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14 4 9l5-5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
    </svg>
  );
}

export function UndoToast({ message, onUndo }: { message: string; onUndo: () => void }) {
  return (
    <div className="app-column fixed inset-x-0 bottom-[calc(68px+env(safe-area-inset-bottom))] z-20 flex justify-center px-4">
      <div className="flex w-full items-center justify-between gap-3 rounded-md bg-zinc-700/85 px-4 py-3 text-sm text-white shadow-lg backdrop-blur-sm dark:bg-zinc-300/85 dark:text-zinc-900">
        <span className="font-medium opacity-70">{message}</span>
        <button type="button" onClick={onUndo} className="flex shrink-0 items-center gap-2 font-semibold">
          <UndoIcon />
          Відмінити
        </button>
      </div>
    </div>
  );
}
