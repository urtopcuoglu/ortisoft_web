"use client";

import { useActionState, useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { createTaskRequest, updateTaskRequest } from "@/modules/tasks/actions";
import { NEW_REQUEST_TYPE_VALUE, type TaskFormState } from "@/modules/tasks/schema";
import { toDateInputValue } from "@/lib/utils";
import AssigneePicker, { type TaskUserOption } from "./AssigneePicker";
import type { TaskDetail } from "./types";

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20";
const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300";

export type TaskRequestTypeOption = { id: string; name: string };
export type TaskRequestRow = TaskDetail["requests"][number];

/**
 * "Talep oluştur" — görev içinde ad-hoc, tarih/saat atanabilen alt-varlık
 * (ör. "Şirket toplantısı oluştur"). MeetingModal ile aynı tarih deseni,
 * artı koşullu saat alanı (boşsa isAllDay=true — bkz. modules/tasks/actions.ts).
 */
export default function TaskRequestModal({
  taskId,
  open,
  onOpenChange,
  requestTypes,
  users,
  request,
  onSaved,
}: {
  taskId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestTypes: TaskRequestTypeOption[];
  users: TaskUserOption[];
  request?: TaskRequestRow | null;
  onSaved: () => void;
}) {
  const isEdit = !!request;
  const action = isEdit
    ? (updateTaskRequest.bind(null, request.id) as (state: TaskFormState, formData: FormData) => Promise<TaskFormState>)
    : (createTaskRequest.bind(null, taskId) as (state: TaskFormState, formData: FormData) => Promise<TaskFormState>);
  const [state, formAction, pending] = useActionState(action, undefined);
  const [typeValue, setTypeValue] = useState(request?.typeId ?? "");

  useEffect(() => {
    if (state?.success) {
      onOpenChange(false);
      onSaved();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.success]);

  const scheduledAt = request?.scheduledAt ? new Date(request.scheduledAt) : null;
  const scheduledTimeDefault =
    scheduledAt && !request?.isAllDay
      ? `${String(scheduledAt.getHours()).padStart(2, "0")}:${String(scheduledAt.getMinutes()).padStart(2, "0")}`
      : "";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-slate-900/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[61] w-[min(520px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
          <div className="mb-5 flex items-center justify-between">
            <Dialog.Title className="text-lg font-extrabold text-slate-900 dark:text-white">
              {isEdit ? "Talebi Düzenle" : "Talep Oluştur"}
            </Dialog.Title>
            <Dialog.Close className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-slate-200">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <form action={formAction} className="flex flex-col gap-4">
            <div>
              <label className={labelClass}>Başlık</label>
              <input
                name="title"
                defaultValue={request?.title}
                placeholder="Örn. Şirket toplantısı oluştur"
                className={inputClass}
              />
              {state?.errors?.title && <p className="mt-1 text-xs text-red-600">{state.errors.title[0]}</p>}
            </div>

            <div>
              <label className={labelClass}>Tür</label>
              <select
                name="typeId"
                value={typeValue}
                onChange={(e) => setTypeValue(e.target.value)}
                className={inputClass}
              >
                <option value="">Seçin…</option>
                {requestTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
                <option value={NEW_REQUEST_TYPE_VALUE}>+ Yeni tür ekle</option>
              </select>
              {typeValue === NEW_REQUEST_TYPE_VALUE && (
                <input name="newTypeName" placeholder="Yeni tür adı" className={`${inputClass} mt-2`} autoFocus required />
              )}
              {state?.errors?.typeId && <p className="mt-1 text-xs text-red-600">{state.errors.typeId[0]}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Tarih</label>
                <input
                  name="scheduledDate"
                  type="date"
                  defaultValue={toDateInputValue(request?.scheduledAt ?? new Date())}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>
                  Saat <span className="font-normal text-slate-400">(opsiyonel — boşsa tüm gün)</span>
                </label>
                <input name="scheduledTime" type="time" defaultValue={scheduledTimeDefault} className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Açıklama</label>
              <textarea name="description" rows={3} defaultValue={request?.description ?? ""} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Atanan Kişi(ler)</label>
              <AssigneePicker
                name="assigneesJson"
                users={users}
                allowAll
                initialSelectedIds={request?.assignees.map((a) => a.userId) ?? []}
              />
              {state?.errors?.assigneesJson && <p className="mt-1 text-xs text-red-600">{state.errors.assigneesJson[0]}</p>}
            </div>

            {state?.message && !state.success && (
              <p className="rounded-lg bg-red-50 dark:bg-red-500/10 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400">
                {state.message}
              </p>
            )}

            <div className="mt-2 flex justify-end gap-2">
              <Dialog.Close className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5">
                Vazgeç
              </Dialog.Close>
              <button
                type="submit"
                disabled={pending}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {pending ? "Kaydediliyor…" : isEdit ? "Kaydet" : "Oluştur"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
