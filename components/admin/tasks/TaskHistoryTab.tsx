"use client";

import { useEffect, useState } from "react";
import { getTaskActivity } from "@/modules/tasks/actions";

const ACTION_LABEL: Record<string, string> = { CREATE: "oluşturdu", UPDATE: "güncelledi", DELETE: "sildi" };

export default function TaskHistoryTab({ taskId }: { taskId: string }) {
  const [logs, setLogs] = useState<Awaited<ReturnType<typeof getTaskActivity>> | null>(null);

  useEffect(() => {
    getTaskActivity(taskId).then(setLogs);
  }, [taskId]);

  if (!logs) return <p className="text-sm text-slate-400">Yükleniyor…</p>;
  if (logs.length === 0) return <p className="text-sm text-slate-400 dark:text-slate-500">Henüz bir değişiklik kaydı yok.</p>;

  return (
    <div className="flex flex-col gap-2.5">
      {logs.map((log) => (
        <div key={log.id} className="flex items-start gap-2 text-sm">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600" />
          <p className="text-slate-600 dark:text-slate-300">
            <strong>{log.actor?.name ?? "Bilinmeyen kullanıcı"}</strong> {ACTION_LABEL[log.action] ?? log.action}
            <span className="ml-2 text-xs text-slate-400">
              {new Date(log.createdAt).toLocaleString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </span>
          </p>
        </div>
      ))}
    </div>
  );
}
