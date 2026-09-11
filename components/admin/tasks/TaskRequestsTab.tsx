"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { deleteTaskRequest } from "@/modules/tasks/actions";
import { TASK_REQUEST_STATUS_LABEL } from "@/modules/tasks/schema";
import { formatTaskDateTime } from "@/lib/utils";
import DeleteForm from "@/components/admin/DeleteForm";
import TaskRequestModal, { type TaskRequestRow, type TaskRequestTypeOption } from "./TaskRequestModal";
import type { TaskUserOption } from "./AssigneePicker";
import type { TaskDetail } from "./types";

const STATUS_BADGE_CLASS: Record<string, string> = {
  PLANLANDI: "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
  TAMAMLANDI: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  IPTAL: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

export default function TaskRequestsTab({
  task,
  requestTypes,
  users,
  onChanged,
}: {
  task: TaskDetail;
  requestTypes: TaskRequestTypeOption[];
  users: TaskUserOption[];
  onChanged: () => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TaskRequestRow | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Talep Oluştur
        </button>
      </div>

      {task.requests.length === 0 && <p className="text-sm text-slate-400 dark:text-slate-500">Henüz talep yok.</p>}

      <div className="flex flex-col gap-2">
        {task.requests.map((r) => (
          <div key={r.id} className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
            <div className="mb-1 flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{r.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {r.type.name} · {formatTaskDateTime(r.scheduledAt, r.isAllDay)}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_BADGE_CLASS[r.status]}`}>
                {TASK_REQUEST_STATUS_LABEL[r.status as keyof typeof TASK_REQUEST_STATUS_LABEL]}
              </span>
            </div>
            {r.description && <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{r.description}</p>}
            <p className="mt-1.5 text-xs text-slate-400">
              Atanan: {r.assignees.map((a) => a.user.name).join(", ") || "—"}
            </p>
            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(r);
                  setModalOpen(true);
                }}
                className="rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
              >
                Düzenle
              </button>
              <DeleteForm
                action={async () => {
                  await deleteTaskRequest(r.id);
                  onChanged();
                }}
                confirmMessage="Bu talep silinsin mi?"
              />
            </div>
          </div>
        ))}
      </div>

      <TaskRequestModal
        key={editing?.id ?? "new"}
        taskId={task.id}
        open={modalOpen}
        onOpenChange={setModalOpen}
        requestTypes={requestTypes}
        users={users}
        request={editing}
        onSaved={onChanged}
      />
    </div>
  );
}
