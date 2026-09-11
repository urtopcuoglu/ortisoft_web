"use client";

import { useActionState, useEffect } from "react";
import { createComment } from "@/modules/tasks/actions";
import type { TaskFormState } from "@/modules/tasks/schema";
import CommentThread, { buildCommentTree } from "./CommentThread";
import type { TaskDetail } from "./types";

export default function CommentsTab({
  task,
  currentUserId,
  isAdmin,
  onChanged,
}: {
  task: TaskDetail;
  currentUserId: string;
  isAdmin: boolean;
  onChanged: () => void;
}) {
  const boundCreate = createComment.bind(null, task.id) as (
    state: TaskFormState,
    formData: FormData
  ) => Promise<TaskFormState>;
  const [state, formAction, pending] = useActionState(boundCreate, undefined);

  useEffect(() => {
    if (state?.success) onChanged();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const roots = buildCommentTree(task.comments);

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-1.5">
        <textarea
          name="body"
          rows={3}
          placeholder="Bir yorum yazın…"
          className="w-full resize-none rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20"
        />
        {state?.errors?.body && <p className="text-xs text-red-600">{state.errors.body[0]}</p>}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {pending ? "Gönderiliyor…" : "Yorum Yap"}
          </button>
        </div>
      </form>

      <div className="flex flex-col gap-3">
        {roots.length === 0 && <p className="text-sm text-slate-400 dark:text-slate-500">Henüz yorum yok.</p>}
        {roots.map((c) => (
          <CommentThread key={c.id} taskId={task.id} comment={c} currentUserId={currentUserId} isAdmin={isAdmin} onChanged={onChanged} />
        ))}
      </div>
    </div>
  );
}
