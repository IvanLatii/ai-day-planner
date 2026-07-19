export type Priority = "low" | "medium" | "high";

export type Task = {
  id: string;
  title: string;
  priority: Priority;
  due_date?: string; // ISO date (YYYY-MM-DD), no time
  time_estimate_min?: number;
  tags: string[];
  status: "inbox" | "today" | "done";
  source_text: string;
  unparsed?: boolean;
  created_at: string;
};

// What the AI (or mock) returns per parsed fragment, before the server
// assigns id/created_at/status.
export type ParsedFragment = {
  title: string;
  priority: Priority;
  due_date?: string;
  time_estimate_min?: number;
  tags: string[];
  source_text: string;
  unparsed?: boolean;
};

export type ParseResult =
  | { ok: true; fragments: ParsedFragment[] }
  | { ok: false; reason: string };
