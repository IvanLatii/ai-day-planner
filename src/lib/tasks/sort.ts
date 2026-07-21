import type { Task } from "./types";

const PRIORITY_RANK: Record<Task["priority"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

// priority ↓, then time_estimate_min ↑ (missing estimate sorts last)
export function sortToday(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const priorityDiff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    const aTime = a.time_estimate_min ?? Infinity;
    const bTime = b.time_estimate_min ?? Infinity;
    return aTime - bTime;
  });
}

// time_estimate_min ↑ (missing estimate sorts last), then priority ↓
export function sortTodayByTime(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const aTime = a.time_estimate_min ?? Infinity;
    const bTime = b.time_estimate_min ?? Infinity;
    if (aTime !== bTime) return aTime - bTime;

    return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
  });
}

// unparsed:true first (needs attention), then newest first
export function sortInbox(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.unparsed && !b.unparsed) return -1;
    if (!a.unparsed && b.unparsed) return 1;
    return b.created_at.localeCompare(a.created_at);
  });
}
