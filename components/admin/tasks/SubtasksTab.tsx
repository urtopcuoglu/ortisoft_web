"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Check, Trash2 } from "lucide-react";
import { createSubtask, toggleSubtask, deleteSubtask, assignSubtask } from "@/modules/tasks/actions";
import type { TaskFormState } from "@/modules/tasks/schema";
import AssigneePicker, { type TaskUserOption } from "./AssigneePicker";
import type { TaskDetail } from "./types";

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20";

function SubtaskRow({
  subtask,
  users,
  onChanged,
}: {
  subtask: TaskDetail["subtasks"][number];
  users: TaskUserOption[];
  onChanged: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [draftAssigneeIds, setDraftAssigneeIds] = useState(subtask.assignees.map((a) => a.userId));

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-200 dark:border-slate-800 p-3">
      <div className="flex items-start gap-2.5">
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => toggleSubtask(subtask.id, !subtask.isDone).then(onChanged))}
          className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border-2 ${
            subtask.isDone
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-slate-300 dark:border-slate-600"
          }`}
        >
          {subtask.isDone && <Check className="h-3 w-3" />}
        </button>
        <p className={`flex-1 text-sm ${subtask.isDone ? "text-slate-400 line-through" : "text-slate-800 dark:text-slate-200"}`}>
          {subtask.title}
        </p>
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => deleteSubtask(subtask.id).then(onChanged))}
          className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex items-center gap-2 pl-7">
        <AssigneePicker
          name="__draftSubtaskAssignees"
          users={users}
          initialSelectedIds={draftAssigneeIds}
          onChange={setDraftAssigneeIds}
        />
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => assignSubtask(subtask.id, draftAssigneeIds).then(onChanged))}
          className="shrink-0 rounded-lg bg-slate-800 dark:bg-slate-700 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-slate-900 disabled:opacity-60"
        >
          Kaydet
        </button>
      </div>
    </div>
  );
}

function AddSubtaskForm({ taskId, users, onAdded }: { taskId: string; users: TaskUserOption[]; onAdded: () => void }) {
  const boundCreate = createSubtask.bind(null, taskId) as (
    state: TaskFormState,
    formData: FormData
  ) => Promise<TaskFormState>;
  const [state, formAction, pending] = useActionState(boundCreate, undefined);

  useEffect(() => {
    if (state?.success) onAdded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-3">
      <input name="title" placeholder="Yeni alt görev başlığı…" className={inputClass} />
      {state?.errors?.title && <p className="text-xs text-red-600">{state.errors.title[0]}</p>}
      <div className="flex items-center justify-between gap-2">
        <AssigneePicker name="assigneeUserIdsJson" users={users} />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {pending ? "Ekleniyor…" : "Alt Görev Ekle"}
        </button>
      </div>
    </form>
  );
}

export default function SubtasksTab({
  task,
  users,
  onChanged,
}: {
  task: TaskDetail;
  users: TaskUserOption[];
  onChanged: () => void;
}) {
  const done = task.subtasks.filter((s) => s.isDone).length;
  const total = task.subtasks.length;

  return (
    <div className="flex flex-col gap-3">
      {total > 0 && (
        <div>
          <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>İlerleme</span>
            <span>
              {done}/{total}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {task.subtasks.map((s) => (
        <SubtaskRow key={s.id} subtask={s} users={users} onChanged={onChanged} />
      ))}

      <AddSubtaskForm taskId={task.id} users={users} onAdded={onChanged} />
    </div>
  );
}
