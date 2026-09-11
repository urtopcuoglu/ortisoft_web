"use client";

import { useActionState, useEffect, useState } from "react";
import { createComment, deleteComment } from "@/modules/tasks/actions";
import type { TaskFormState } from "@/modules/tasks/schema";
import type { TaskDetail } from "./types";

export type CommentNode = TaskDetail["comments"][number] & { replies: CommentNode[] };

/** Yorumların düz listesini (parentCommentId) ağaca çevirir — sonsuz derinlik, client-side. */
export function buildCommentTree(comments: TaskDetail["comments"]): CommentNode[] {
  const map = new Map<string, CommentNode>();
  comments.forEach((c) => map.set(c.id, { ...c, replies: [] }));
  const roots: CommentNode[] = [];
  comments.forEach((c) => {
    const node = map.get(c.id)!;
    if (c.parentCommentId && map.has(c.parentCommentId)) {
      map.get(c.parentCommentId)!.replies.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

/**
 * Tek bir yorum + kendi altındaki yanıtları render eden rekürsif bileşen —
 * "sonsuz dinamik" iç içe yanıt (bkz. plan) buradan geliyor: her düğüm kendi
 * replies dizisini yine CommentThread ile render ediyor, derinlik sınırı yok.
 */
export default function CommentThread({
  taskId,
  comment,
  currentUserId,
  isAdmin,
  onChanged,
}: {
  taskId: string;
  comment: CommentNode;
  currentUserId: string;
  isAdmin: boolean;
  onChanged: () => void;
}) {
  const [replying, setReplying] = useState(false);
  const boundReply = createComment.bind(null, taskId) as (
    state: TaskFormState,
    formData: FormData
  ) => Promise<TaskFormState>;
  const [state, formAction, pending] = useActionState(boundReply, undefined);

  useEffect(() => {
    if (state?.success) {
      setReplying(false);
      onChanged();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const canDelete = !comment.isDeleted && (comment.authorId === currentUserId || isAdmin);

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {comment.author?.name ?? "Silinmiş kullanıcı"}
          </span>
          <span className="text-[11px] text-slate-400">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className={`text-sm ${comment.isDeleted ? "italic text-slate-400" : "text-slate-700 dark:text-slate-300"}`}>
          {comment.isDeleted ? "Bu yorum silindi." : comment.body}
        </p>
        <div className="mt-1.5 flex items-center gap-3">
          {!comment.isDeleted && (
            <button
              type="button"
              onClick={() => setReplying((v) => !v)}
              className="text-[11px] font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              Yanıtla
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => {
                if (confirm("Bu yorumu silmek istediğinize emin misiniz?")) {
                  deleteComment(comment.id).then(onChanged);
                }
              }}
              className="text-[11px] font-semibold text-red-600 hover:underline dark:text-red-400"
            >
              Sil
            </button>
          )}
        </div>

        {replying && (
          <form action={formAction} className="mt-2.5 flex flex-col gap-1.5">
            <input type="hidden" name="parentCommentId" value={comment.id} />
            <textarea
              name="body"
              rows={2}
              autoFocus
              placeholder="Yanıt yazın…"
              className="w-full resize-none rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
            />
            {state?.errors?.body && <p className="text-[10px] text-red-600">{state.errors.body[0]}</p>}
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setReplying(false)}
                className="rounded-md px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={pending}
                className="rounded-md bg-blue-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {pending ? "Gönderiliyor…" : "Yanıtla"}
              </button>
            </div>
          </form>
        )}
      </div>

      {comment.replies.length > 0 && (
        <div className="ml-5 flex flex-col gap-2 border-l-2 border-slate-100 dark:border-slate-800 pl-3">
          {comment.replies.map((r) => (
            <CommentThread key={r.id} taskId={taskId} comment={r} currentUserId={currentUserId} isAdmin={isAdmin} onChanged={onChanged} />
          ))}
        </div>
      )}
    </div>
  );
}
