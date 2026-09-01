"use client";

import { useActionState, useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X } from "lucide-react";
import DeleteForm from "@/components/admin/DeleteForm";
import { createClientAgreement, updateClientAgreement, deleteClientAgreement } from "@/modules/crm/actions";
import { type ClientAgreementFormState } from "@/modules/crm/schema";
import { toDateInputValue } from "@/lib/utils";

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20";
const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300";

export type AgreementRow = {
  id: string;
  title: string;
  fileUrl: string | null;
  signedAt: Date | string | null;
  startDate: Date | string | null;
  endDate: Date | string | null;
  notes: string | null;
};

function AgreementModal({
  contactId,
  open,
  onOpenChange,
  agreement,
}: {
  contactId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agreement?: AgreementRow | null;
}) {
  const isEdit = !!agreement;
  const action = isEdit
    ? (updateClientAgreement.bind(null, agreement.id, contactId) as (
        state: ClientAgreementFormState,
        formData: FormData
      ) => Promise<ClientAgreementFormState>)
    : (createClientAgreement.bind(null, contactId) as (
        state: ClientAgreementFormState,
        formData: FormData
      ) => Promise<ClientAgreementFormState>);
  const [state, formAction, pending] = useActionState(action, undefined);

  useEffect(() => {
    if (state?.success) onOpenChange(false);
  }, [state?.success, onOpenChange]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-900/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(520px,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
          <div className="mb-5 flex items-center justify-between">
            <Dialog.Title className="text-lg font-extrabold text-slate-900 dark:text-white">
              {isEdit ? "Sözleşmeyi Düzenle" : "Yeni Sözleşme"}
            </Dialog.Title>
            <Dialog.Close className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-slate-200">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <form action={formAction} className="flex flex-col gap-4">
            <div>
              <label className={labelClass}>Başlık</label>
              <input name="title" defaultValue={agreement?.title} className={inputClass} required />
              {state?.errors?.title && <p className="mt-1 text-xs text-red-600">{state.errors.title[0]}</p>}
            </div>

            <div>
              <label className={labelClass}>
                Sözleşme Dosyası Linki <span className="font-normal text-slate-400 dark:text-slate-500">(opsiyonel)</span>
              </label>
              <input name="fileUrl" placeholder="https://..." defaultValue={agreement?.fileUrl ?? ""} className={inputClass} />
              {state?.errors?.fileUrl && <p className="mt-1 text-xs text-red-600">{state.errors.fileUrl[0]}</p>}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>İmza Tarihi</label>
                <input name="signedAt" type="date" defaultValue={toDateInputValue(agreement?.signedAt)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Başlangıç</label>
                <input name="startDate" type="date" defaultValue={toDateInputValue(agreement?.startDate)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Bitiş</label>
                <input name="endDate" type="date" defaultValue={toDateInputValue(agreement?.endDate)} className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Not</label>
              <textarea name="notes" rows={3} defaultValue={agreement?.notes ?? ""} className={inputClass} />
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

export default function AgreementsPanel({ contactId, agreements }: { contactId: string; agreements: AgreementRow[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AgreementRow | null>(null);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Sözleşme Ekle
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Başlık</th>
              <th className="px-4 py-3">İmza Tarihi</th>
              <th className="px-4 py-3">Kapsam</th>
              <th className="px-4 py-3">Dosya</th>
              <th className="px-4 py-3 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {agreements.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                  Henüz sözleşme yok.
                </td>
              </tr>
            )}
            {agreements.map((a) => (
              <tr key={a.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">{a.title}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500 dark:text-slate-400">
                  {a.signedAt ? new Date(a.signedAt).toLocaleDateString("tr-TR") : "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500 dark:text-slate-400">
                  {a.startDate ? new Date(a.startDate).toLocaleDateString("tr-TR") : "—"}
                  {a.endDate ? ` – ${new Date(a.endDate).toLocaleDateString("tr-TR")}` : ""}
                </td>
                <td className="px-4 py-3">
                  {a.fileUrl ? (
                    <a href={a.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                      Görüntüle
                    </a>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => { setEditing(a); setModalOpen(true); }}
                      className="rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                      Düzenle
                    </button>
                    <DeleteForm
                      action={deleteClientAgreement.bind(null, a.id, contactId)}
                      confirmMessage={`"${a.title}" sözleşmesi silinsin mi?`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AgreementModal key={editing?.id ?? "new"} contactId={contactId} open={modalOpen} onOpenChange={setModalOpen} agreement={editing} />
    </div>
  );
}
