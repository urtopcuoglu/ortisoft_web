"use client";

import { useCallback, useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { getTask } from "@/modules/tasks/actions";
import TaskDescriptionTab from "./TaskDescriptionTab";
import SubtasksTab from "./SubtasksTab";
import TaskRequestsTab from "./TaskRequestsTab";
import CommentsTab from "./CommentsTab";
import TaskHistoryTab from "./TaskHistoryTab";
import type { TaskDetail } from "./types";
import type { TaskUserOption } from "./AssigneePicker";
import type { TaskLabelOption } from "./LabelPicker";
import type { TaskRequestTypeOption } from "./TaskRequestModal";

type Tab = "description" | "subtasks" | "requests" | "comments" | "history";

/**
 * Görev detayı — Trello card-detail tarzı büyük overlay (ayrı bir sayfa
 * DEĞİL, kartın üstüne açılır — bkz. plan dokümanı "modal-vs-page" kararı).
 * Veri kartın tıklanma anında client-side getTask() ile çekilir; her
 * değişiklikten sonra reload() ile tazelenir (revalidatePath board'u
 * güncel tutar, ama açık modal kendi state'ini elle yeniler).
 */
export default function TaskDetailModal({
  taskId,
  open,
  onOpenChange,
  users,
  labels,
  requestTypes,
  currentUserId,
  isAdmin,
}: {
  taskId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: TaskUserOption[];
  labels: TaskLabelOption[];
  requestTypes: TaskRequestTypeOption[];
  currentUserId: string;
  isAdmin: boolean;
}) {
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("description");

  const reload = useCallback(() => {
    setLoading(true);
    getTask(taskId).then((t) => {
      setTask(t);
      setLoading(false);
    });
  }, [taskId]);

  useEffect(() => {
    // Görev açıldığında/taskId değiştiğinde veri çekimi — reload() içindeki
    // setState'ler NotificationsBell.tsx'teki "mount sonrası gerçek değeri
    // bas" gerekçesiyle aynı şekilde kasıtlı.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [reload]);

  const TABS: { key: Tab; label: string; count?: number }[] = task
    ? [
        { key: "description", label: "Açıklama" },
        { key: "subtasks", label: "Alt Görevler", count: task.subtasks.length },
        { key: "requests", label: "Talepler", count: task.requests.length },
        { key: "comments", label: "Yorumlar", count: task.comments.filter((c) => !c.isDeleted).length },
        { key: "history", label: "Geçmiş" },
      ]
    : [];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-900/50 data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(760px,94vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-extrabold text-slate-900 dark:text-white">
              {task?.title ?? "Görev"}
              {task?.archived && (
                <span className="ml-2 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-500">
                  Arşivlendi
                </span>
              )}
            </Dialog.Title>
            <Dialog.Close className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-slate-200">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          {loading && <p className="text-sm text-slate-400">Yükleniyor…</p>}
          {!loading && !task && <p className="text-sm text-red-600">Görev bulunamadı.</p>}

          {!loading && task && (
            <div>
              <div className="mb-5 flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTab(t.key)}
                    className={`shrink-0 border-b-2 px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                      tab === t.key
                        ? "border-blue-600 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                  >
                    {t.label}
                    {t.count !== undefined && (
                      <span className="ml-1 text-xs font-normal text-slate-400 dark:text-slate-500">({t.count})</span>
                    )}
                  </button>
                ))}
              </div>

              {tab === "description" && <TaskDescriptionTab task={task} users={users} labels={labels} onSaved={reload} />}
              {tab === "subtasks" && <SubtasksTab task={task} users={users} onChanged={reload} />}
              {tab === "requests" && (
                <TaskRequestsTab task={task} requestTypes={requestTypes} users={users} onChanged={reload} />
              )}
              {tab === "comments" && (
                <CommentsTab task={task} currentUserId={currentUserId} isAdmin={isAdmin} onChanged={reload} />
              )}
              {tab === "history" && <TaskHistoryTab taskId={task.id} />}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
