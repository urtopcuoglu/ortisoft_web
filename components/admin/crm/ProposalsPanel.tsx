"use client";

import { useActionState, useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X } from "lucide-react";
import DeleteForm from "@/components/admin/DeleteForm";
import { createProposal, updateProposal, deleteProposal } from "@/modules/crm/actions";
import { PROPOSAL_STATUS_LABEL, PROPOSAL_STATUSES, type ProposalFormState } from "@/modules/crm/schema";
import { toDateInputValue } from "@/lib/utils";
import type { ProposalStatus } from "@/lib/generated/prisma/client";

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20";
const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300";

const STATUS_CLASS: Record<ProposalStatus, string> = {
  SENT: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  ACCEPTED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  EXPIRED: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

export type ProposalRow = {
  id: string;
  title: string;
  amount: unknown; // Prisma Decimal — String()/Number() ile göster
  currency: string;
  status: ProposalStatus;
  sentAt: Date | string;
  respondedAt: Date | string | null;
  fileUrl: string | null;
  notes: string | null;
};

function ProposalModal({
  contactId,
  open,
  onOpenChange,
  proposal,
}: {
  contactId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal?: ProposalRow | null;
}) {
  const isEdit = !!proposal;
  const action = isEdit
    ? (updateProposal.bind(null, proposal.id, contactId) as (
        state: ProposalFormState,
        formData: FormData
      ) => Promise<ProposalFormState>)
    : (createProposal.bind(null, contactId) as (
        state: ProposalFormState,
        formData: FormData
      ) => Promise<ProposalFormState>);
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
              {isEdit ? "Teklifi Düzenle" : "Yeni Teklif"}
            </Dialog.Title>
            <Dialog.Close className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-slate-200">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <form action={formAction} className="flex flex-col gap-4">
            <div>
              <label className={labelClass}>Başlık</label>
              <input name="title" defaultValue={proposal?.title} className={inputClass} required />
              {state?.errors?.title && <p className="mt-1 text-xs text-red-600">{state.errors.title[0]}</p>}
            </div>

            <div className="grid grid-cols-[2fr_1fr] gap-4">
              <div>
                <label className={labelClass}>Tutar</label>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={proposal ? String(proposal.amount) : undefined}
                  className={inputClass}
                  required
                />
                {state?.errors?.amount && <p className="mt-1 text-xs text-red-600">{state.errors.amount[0]}</p>}
              </div>
              <div>
                <label className={labelClass}>Para Birimi</label>
                <input name="currency" defaultValue={proposal?.currency ?? "TRY"} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Gönderim Tarihi</label>
                <input
                  name="sentAt"
                  type="date"
                  defaultValue={toDateInputValue(proposal?.sentAt) || toDateInputValue(new Date())}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Durum</label>
                <select name="status" defaultValue={proposal?.status ?? "SENT"} className={inputClass}>
                  {PROPOSAL_STATUSES.map((s) => (
                    <option key={s} value={s}>{PROPOSAL_STATUS_LABEL[s]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Yanıt Tarihi <span className="font-normal text-slate-400 dark:text-slate-500">(opsiyonel)</span>
              </label>
              <input name="respondedAt" type="date" defaultValue={toDateInputValue(proposal?.respondedAt)} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>
                Teklif Dosyası Linki <span className="font-normal text-slate-400 dark:text-slate-500">(opsiyonel)</span>
              </label>
              <input name="fileUrl" placeholder="https://..." defaultValue={proposal?.fileUrl ?? ""} className={inputClass} />
              {state?.errors?.fileUrl && <p className="mt-1 text-xs text-red-600">{state.errors.fileUrl[0]}</p>}
            </div>

            <div>
              <label className={labelClass}>Not</label>
              <textarea name="notes" rows={3} defaultValue={proposal?.notes ?? ""} className={inputClass} />
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

export default function ProposalsPanel({ contactId, proposals }: { contactId: string; proposals: ProposalRow[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProposalRow | null>(null);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Teklif Ekle
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Başlık</th>
              <th className="px-4 py-3">Tutar</th>
              <th className="px-4 py-3">Gönderim</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {proposals.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                  Henüz teklif yok.
                </td>
              </tr>
            )}
            {proposals.map((p) => (
              <tr key={p.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">{p.title}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500 dark:text-slate-400">
                  {Number(p.amount).toLocaleString("tr-TR")} {p.currency}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500 dark:text-slate-400">
                  {new Date(p.sentAt).toLocaleDateString("tr-TR")}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_CLASS[p.status]}`}>
                    {PROPOSAL_STATUS_LABEL[p.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => { setEditing(p); setModalOpen(true); }}
                      className="rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                      Düzenle
                    </button>
                    <DeleteForm
                      action={deleteProposal.bind(null, p.id, contactId)}
                      confirmMessage={`"${p.title}" teklifi silinsin mi?`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProposalModal key={editing?.id ?? "new"} contactId={contactId} open={modalOpen} onOpenChange={setModalOpen} proposal={editing} />
    </div>
  );
}
