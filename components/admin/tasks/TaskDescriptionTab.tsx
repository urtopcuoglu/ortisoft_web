"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { updateTask, assignTask, archiveTask, restoreTask } from "@/modules/tasks/actions";
import { TASK_PRIORITIES, TASK_PRIORITY_LABEL, type TaskFormState } from "@/modules/tasks/schema";
import { toDateInputValue } from "@/lib/utils";
import RichTextEditor from "@/components/admin/RichTextEditor";
import AssigneePicker, { type TaskUserOption } from "./AssigneePicker";
import LabelPicker, { type TaskLabelOption } from "./LabelPicker";
import type { TaskDetail } from "./types";

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20";
const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300";

export default function TaskDescriptionTab({
  task,
  users,
  labels,
  onSaved,
}: {
  task: TaskDetail;
  users: TaskUserOption[];
  labels: TaskLabelOption[];
  onSaved: () => void;
}) {
  const boundUpdate = updateTask.bind(null, task.id) as (
    state: TaskFormState,
    formData: FormData
  ) => Promise<TaskFormState>;
  const [state, formAction, pending] = useActionState(boundUpdate, undefined);

  const [assigneeIds, setAssigneeIds] = useState(task.assignees.map((a) => a.userId));
  const [assignPending, startAssignTransition] = useTransition();
  const [archivePending, startArchiveTransition] = useTransition();

  useEffect(() => {
    if (state?.success) onSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function saveAssignees(ids: string[]) {
    setAssigneeIds(ids);
    startAssignTransition(() => {
      assignTask(task.id, ids).then(onSaved);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className={labelClass}>Atananlar</label>
        <AssigneeEditor users={users} initialSelectedIds={assigneeIds} onSave={saveAssignees} pending={assignPending} />
        {task.createdBy && (
          <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">Oluşturan: {task.createdBy.name}</p>
        )}
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label className={labelClass}>Başlık</label>
          <input name="title" defaultValue={task.title} className={inputClass} />
          {state?.errors?.title && <p className="mt-1 text-xs text-red-600">{state.errors.title[0]}</p>}
        </div>

        <div>
          <label className={labelClass}>Açıklama</label>
          <RichTextEditor name="description" defaultValue={task.description ?? ""} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Öncelik</label>
            <select name="priority" defaultValue={task.priority} className={inputClass}>
              {TASK_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {TASK_PRIORITY_LABEL[p]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Başlangıç</label>
            <input type="date" name="startAt" defaultValue={toDateInputValue(task.startAt)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Bitiş / Vade</label>
            <input type="date" name="dueAt" defaultValue={toDateInputValue(task.dueAt)} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Etiketler</label>
          <LabelPicker
            existingLabelsInputName="labelIdsJson"
            newLabelsInputName="newLabelsJson"
            labels={labels}
            initialSelectedIds={task.labels.map((l) => l.id)}
          />
        </div>

        {state?.message && !state.success && (
          <p className="rounded-lg bg-red-50 dark:bg-red-500/10 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400">
            {state.message}
          </p>
        )}

        <div className="flex items-center justify-between">
          <button
            type="button"
            disabled={archivePending}
            onClick={() => {
              startArchiveTransition(async () => {
                if (task.archived) await restoreTask(task.id);
                else await archiveTask(task.id);
                onSaved();
              });
            }}
            className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-60"
          >
            {task.archived ? "Arşivden Çıkar" : "Arşivle"}
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {pending ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}

/**
 * AssigneePicker'ı "Kaydet" düğmesiyle saran ince katman — atama değişikliği
 * ayrı bir aksiyon (assignTask) olduğu için ana forma dahil değil (bkz.
 * modules/tasks/actions.ts dosya başı notu).
 */
function AssigneeEditor({
  users,
  initialSelectedIds,
  onSave,
  pending,
}: {
  users: TaskUserOption[];
  initialSelectedIds: string[];
  onSave: (ids: string[]) => void;
  pending: boolean;
}) {
  const [draftIds, setDraftIds] = useState(initialSelectedIds);

  return (
    <div className="flex items-start gap-2">
      <div className="flex-1">
        <AssigneePicker name="__draftAssignees" users={users} initialSelectedIds={initialSelectedIds} onChange={setDraftIds} />
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={() => onSave(draftIds)}
        className="shrink-0 rounded-lg bg-slate-800 dark:bg-slate-700 px-3 py-2 text-xs font-bold text-white hover:bg-slate-900 disabled:opacity-60"
      >
        {pending ? "…" : "Kaydet"}
      </button>
    </div>
  );
}
