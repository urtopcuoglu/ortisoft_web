"use client";

import { useActionState, useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X } from "lucide-react";
import DeleteForm from "@/components/admin/DeleteForm";
import { createClientMeeting, updateClientMeeting, deleteClientMeeting } from "@/modules/crm/actions";
import { MEETING_TYPE_LABEL, MEETING_TYPES, type ClientMeetingFormState } from "@/modules/crm/schema";
import { toDateInputValue } from "@/lib/utils";
import type { MeetingType } from "@/lib/generated/prisma/client";

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20";
const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300";

export type MeetingRow = {
  id: string;
  type: MeetingType;
  occurredAt: Date | string;
  notes: string;
  createdBy: { name: string } | null;
};

function MeetingModal({
  contactId,
  open,
  onOpenChange,
  meeting,
}: {
  contactId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting?: MeetingRow | null;
}) {
  const isEdit = !!meeting;
  const action = isEdit
    ? (updateClientMeeting.bind(null, meeting.id, contactId) as (
        state: ClientMeetingFormState,
        formData: FormData
      ) => Promise<ClientMeetingFormState>)
    : (createClientMeeting.bind(null, contactId) as (
        state: ClientMeetingFormState,
        formData: FormData
      ) => Promise<ClientMeetingFormState>);
  const [state, formAction, pending] = useActionState(action, undefined);

  useEffect(() => {
    if (state?.success) onOpenChange(false);
  }, [state?.success, onOpenChange]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-900/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(480px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
          <div className="mb-5 flex items-center justify-between">
            <Dialog.Title className="text-lg font-extrabold text-slate-900 dark:text-white">
              {isEdit ? "Görüşmeyi Düzenle" : "Yeni Görüşme Notu"}
            </Dialog.Title>
            <Dialog.Close className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-slate-200">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <form action={formAction} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Görüşme Tipi</label>
                <select name="type" defaultValue={meeting?.type ?? MEETING_TYPES[0]} className={inputClass}>
                  {MEETING_TYPES.map((t) => (
                    <option key={t} value={t}>{MEETING_TYPE_LABEL[t]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Tarih</label>
                <input
                  name="occurredAt"
                  type="date"
                  defaultValue={toDateInputValue(meeting?.occurredAt) || toDateInputValue(new Date())}
                  className={inputClass}
                  required
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Not</label>
              <textarea name="notes" rows={4} defaultValue={meeting?.notes} className={inputClass} required />
              {state?.errors?.notes && <p className="mt-1 text-xs text-red-600">{state.errors.notes[0]}</p>}
            </div>

            <div className="mt-2 flex justify-end gap-2">
              <Dialog.Close className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5">
                Vazgeç
              </Dialog.Close>
              <button
                type="submit"
                disabled={pending}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {pending ? "Kaydediliyor…" : isEdit ? "Kaydet" : "Ekle"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function MeetingsPanel({ contactId, meetings }: { contactId: string; meetings: MeetingRow[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MeetingRow | null>(null);

  const counts = MEETING_TYPES.map((t) => ({
    type: t,
    label: MEETING_TYPE_LABEL[t],
    count: meetings.filter((m) => m.type === t).length,
  }));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {counts.map((c) => (
            <span
              key={c.type}
              className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300"
            >
              {c.label}: {c.count}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Görüşme Ekle
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Tarih</th>
              <th className="px-4 py-3">Tip</th>
              <th className="px-4 py-3">Not</th>
              <th className="px-4 py-3">Ekleyen</th>
              <th className="px-4 py-3 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {meetings.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                  Henüz görüşme kaydı yok.
                </td>
              </tr>
            )}
            {meetings.map((m) => (
              <tr key={m.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 align-top">
                <td className="whitespace-nowrap px-4 py-3 text-slate-500 dark:text-slate-400">
                  {new Date(m.occurredAt).toLocaleDateString("tr-TR")}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {MEETING_TYPE_LABEL[m.type]}
                  </span>
                </td>
                <td className="max-w-md px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{m.notes}</td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{m.createdBy?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => { setEditing(m); setModalOpen(true); }}
                      className="rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                      Düzenle
                    </button>
                    <DeleteForm
                      action={deleteClientMeeting.bind(null, m.id, contactId)}
                      confirmMessage="Bu görüşme kaydı silinsin mi?"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <MeetingModal key={editing?.id ?? "new"} contactId={contactId} open={modalOpen} onOpenChange={setModalOpen} meeting={editing} />
    </div>
  );
}
