"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ParseResult, Priority, Task } from "./types";
import { loadTasks, saveTasks } from "./storage";
import { sortInbox, sortToday } from "./sort";

type CaptureResult = { ok: true } | { ok: false; reason: string };

type EditableFields = Partial<
  Pick<Task, "title" | "due_date" | "time_estimate_min" | "tags">
>;

type TasksContextValue = {
  isLoaded: boolean;
  hasAnyTasks: boolean;
  inboxTasks: Task[];
  todayTasks: Task[];
  addFromCapture: (text: string) => Promise<CaptureResult>;
  startDay: () => void;
  toggleDone: (id: string) => void;
  returnToInbox: (id: string) => void;
  cyclePriority: (id: string) => void;
  updateTask: (id: string, patch: EditableFields) => void;
};

const TasksContext = createContext<TasksContextValue | null>(null);

const PRIORITY_CYCLE: Record<Priority, Priority> = {
  low: "medium",
  medium: "high",
  high: "low",
};

// Client-local date, not UTC — a serverless function's UTC "today" can be
// wrong by hours around midnight for a Ukraine-based user.
function todayISODate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Hydrate from localStorage after mount only — it doesn't exist on the
  // server, and reading it during render would cause a hydration mismatch.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTasks(loadTasks());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) saveTasks(tasks);
  }, [tasks, isLoaded]);

  const addFromCapture = useCallback(
    async (text: string): Promise<CaptureResult> => {
      let result: ParseResult;
      try {
        const res = await fetch("/api/parse-tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, today: todayISODate() }),
        });
        result = await res.json();
      } catch {
        return { ok: false, reason: "network_error" };
      }

      if (!result.ok) {
        return { ok: false, reason: result.reason };
      }

      const now = new Date().toISOString();
      const newTasks: Task[] = result.fragments.map((fragment) => ({
        ...fragment,
        id: crypto.randomUUID(),
        status: "inbox",
        created_at: now,
      }));

      setTasks((prev) => [...prev, ...newTasks]);
      return { ok: true };
    },
    []
  );

  // Everything from Inbox moves to Today, except tasks with a future
  // due_date — those stay put and "mature" into Today on their own day.
  const startDay = useCallback(() => {
    const today = todayISODate();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.status !== "inbox") return t;
        const isFuture = !!t.due_date && t.due_date > today;
        return isFuture ? t : { ...t, status: "today" };
      })
    );
  }, []);

  const toggleDone = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "done" ? "today" : "done" }
          : t
      )
    );
  }, []);

  const returnToInbox = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "inbox" } : t))
    );
  }, []);

  const cyclePriority = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, priority: PRIORITY_CYCLE[t.priority] } : t
      )
    );
  }, []);

  const updateTask = useCallback((id: string, patch: EditableFields) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
    );
  }, []);

  const inboxTasks = useMemo(
    () => sortInbox(tasks.filter((t) => t.status === "inbox")),
    [tasks]
  );
  const todayTasks = useMemo(
    () => sortToday(tasks.filter((t) => t.status === "today")),
    [tasks]
  );
  const hasAnyTasks = tasks.length > 0;

  const value: TasksContextValue = {
    isLoaded,
    hasAnyTasks,
    inboxTasks,
    todayTasks,
    addFromCapture,
    startDay,
    toggleDone,
    returnToInbox,
    cyclePriority,
    updateTask,
  };

  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
}

export function useTasks(): TasksContextValue {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used within TasksProvider");
  return ctx;
}
