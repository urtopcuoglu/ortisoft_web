"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { dueStatus, TASK_PRIORITY_BADGE_CLASS, type TaskRow } from "./types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}
function clampToMonth(date: Date, monthStart: Date, monthEnd: Date) {
  if (date < monthStart) return monthStart;
  if (date > monthEnd) return monthEnd;
  return date;
}

type Row = { key: string; label: string; tasks: TaskRow[] };

/**
 * Zaman Çizelgesi v1 kapsamı — tam sürükle-yeniden-boyutlandır Gantt DEĞİL,
 * atanan-bazlı yatay bar chart (bkz. plan dokümanı). Kanban ile AYNI `tasks`
 * verisini kullanır (view sadece sunum, ayrı bir fetch yok). Tarih değişikliği
 * burada değil, kart detayından (updateTask) yapılır — ikinci bir persistence
 * yolu açılmasın diye. TaskRequest işaretçileri v1'de yok (listTasks() onları
 * içermiyor, board sorgusunu hafif tutmak için); ileride eklenmesi kolay.
 */
export default function TimelineView({ tasks, onOpenTask }: { tasks: TaskRow[]; onOpenTask: (taskId: string) => void }) {
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()));
  // monthStart/monthEnd her render'da yeni bir Date referansı olmasın diye
  // (aksi halde aşağıdaki useMemo'ların bağımlılığı hep "değişti" sanır)
  // tek bir useMemo'da, monthCursor'ın PRIMITIVE zaman damgasına göre hesaplanır.
  const { monthStart, monthEnd, totalDays } = useMemo(() => {
    const start = startOfMonth(monthCursor);
    const days = daysInMonth(monthCursor);
    const end = new Date(start.getFullYear(), start.getMonth(), days, 23, 59, 59);
    return { monthStart: start, monthEnd: end, totalDays: days };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthCursor.getTime()]);

  const rows: Row[] = useMemo(() => {
    const byUser = new Map<string, Row>();
    const undated: TaskRow[] = [];

    for (const t of tasks) {
      const hasDate = t.startAt || t.dueAt;
      if (!hasDate) {
        undated.push(t);
        continue;
      }
      const due = t.dueAt ? new Date(t.dueAt) : null;
      const start = t.startAt ? new Date(t.startAt) : due;
      if (!start) continue;
      const end = due ?? start;
      // Ay aralığıyla hiç kesişmiyorsa bu ayda gösterilmez.
      if (end < monthStart || start > monthEnd) continue;

      if (t.assignees.length === 0) {
        undated.push(t);
        continue;
      }
      for (const a of t.assignees) {
        const key = a.userId;
        if (!byUser.has(key)) byUser.set(key, { key, label: a.user.name, tasks: [] });
        byUser.get(key)!.tasks.push(t);
      }
    }

    const rows = Array.from(byUser.values()).sort((a, b) => a.label.localeCompare(b.label, "tr"));
    if (undated.length > 0) rows.push({ key: "__undated__", label: "Atanmamış / Tarihsiz", tasks: undated });
    return rows;
  }, [tasks, monthStart, monthEnd]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
            className="rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {monthStart.toLocaleDateString("tr-TR", { month: "long", year: "numeric" })}
          </span>
          <button
            type="button"
            onClick={() => setMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
            className="rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">Bu ay için görev bulunmuyor.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="min-w-[760px]">
            {rows.map((row) => (
              <div key={row.key} className="flex border-b border-slate-100 dark:border-slate-800 last:border-0">
                <div className="w-40 shrink-0 truncate border-r border-slate-100 dark:border-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {row.label}
                </div>
                <div className="relative flex-1 py-2">
                  {row.tasks.map((t) => {
                    const due = t.dueAt ? new Date(t.dueAt) : null;
                    const start = t.startAt ? new Date(t.startAt) : due;
                    if (!start) return null;
                    const end = due ?? start;
                    const clampedStart = clampToMonth(start, monthStart, monthEnd);
                    const clampedEnd = clampToMonth(end, monthStart, monthEnd);
                    const startDayIdx = Math.floor((clampedStart.getTime() - monthStart.getTime()) / MS_PER_DAY);
                    const spanDays = Math.max(1, Math.round((clampedEnd.getTime() - clampedStart.getTime()) / MS_PER_DAY) + 1);
                    const leftPct = (startDayIdx / totalDays) * 100;
                    const widthPct = (spanDays / totalDays) * 100;
                    const status = dueStatus(t.dueAt);

                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => onOpenTask(t.id)}
                        title={t.title}
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                        className={`relative mb-1 block truncate rounded-md px-2 py-1 text-left text-[11px] font-semibold text-white hover:opacity-90 ${
                          status === "overdue" ? "bg-red-500" : TASK_PRIORITY_BADGE_CLASS[t.priority]?.includes("red") ? "bg-red-400" : "bg-blue-500"
                        }`}
                      >
                        {t.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
