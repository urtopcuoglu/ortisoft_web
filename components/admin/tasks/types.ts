import type { listTasks, getTask } from "@/modules/tasks/actions";

// Board/Timeline'ın çalıştığı satır tipi — listTasks()'in döndürdüğü şekli
// birebir yansıtır (InfluencerRow ile aynı "Awaited<ReturnType<>>" deseni).
export type TaskRow = Awaited<ReturnType<typeof listTasks>>[number];
export type TaskDetail = NonNullable<Awaited<ReturnType<typeof getTask>>>;

export type DueStatus = "overdue" | "soon" | "normal" | "none";

/** Kart üzerindeki vade rozeti rengi — gecikmiş kırmızı, 48 saat içinde amber. */
export function dueStatus(dueAt: Date | string | null): DueStatus {
  if (!dueAt) return "none";
  const due = typeof dueAt === "string" ? new Date(dueAt) : dueAt;
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  if (diffMs < 0) return "overdue";
  if (diffMs < 48 * 60 * 60 * 1000) return "soon";
  return "normal";
}

export const DUE_STATUS_BADGE_CLASS: Record<DueStatus, string> = {
  overdue: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  soon: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  normal: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  none: "",
};

export function subtaskProgress(row: TaskRow | TaskDetail): { done: number; total: number } {
  const total = row.subtasks.length;
  const done = row.subtasks.filter((s) => s.isDone).length;
  return { done, total };
}

export const TASK_PRIORITY_BADGE_CLASS: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  MEDIUM: "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
  HIGH: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  URGENT: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};
