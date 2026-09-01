"use client";

import { useActionState, useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X } from "lucide-react";
import DeleteForm from "@/components/admin/DeleteForm";
import { createPayment, updatePayment, deletePayment } from "@/modules/crm/actions";
import {
  PAYMENT_METHOD_LABEL,
  PAYMENT_METHODS,
  PAYMENT_PERIOD_LABEL,
  PAYMENT_PERIODS,
  type PaymentFormState,
} from "@/modules/crm/schema";
import { toDateInputValue } from "@/lib/utils";

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20";
const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300";

export type PaymentRow = {
  id: string;
  amount: unknown; // Prisma Decimal
  currency: string;
  method: (typeof PAYMENT_METHODS)[number];
  period: (typeof PAYMENT_PERIODS)[number];
  dueDate: Date | string | null;
  paidAt: Date | string | null;
  notes: string | null;
};

function PaymentModal({
  contactId,
  open,
  onOpenChange,
  payment,
}: {
  contactId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment?: PaymentRow | null;
}) {
  const isEdit = !!payment;
  const action = isEdit
    ? (updatePayment.bind(null, payment.id, contactId) as (
        state: PaymentFormState,
        formData: FormData
      ) => Promise<PaymentFormState>)
    : (createPayment.bind(null, contactId) as (
        state: PaymentFormState,
        formData: FormData
      ) => Promise<PaymentFormState>);
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
              {isEdit ? "Ödemeyi Düzenle" : "Yeni Ödeme"}
            </Dialog.Title>
            <Dialog.Close className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-slate-200">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <form action={formAction} className="flex flex-col gap-4">
            <div className="grid grid-cols-[2fr_1fr] gap-4">
              <div>
                <label className={labelClass}>Tutar</label>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={payment ? String(payment.amount) : undefined}
                  className={inputClass}
                  required
                />
                {state?.errors?.amount && <p className="mt-1 text-xs text-red-600">{state.errors.amount[0]}</p>}
              </div>
              <div>
                <label className={labelClass}>Para Birimi</label>
                <input name="currency" defaultValue={payment?.currency ?? "TRY"} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Ödeme Tipi</label>
                <select name="method" defaultValue={payment?.method ?? PAYMENT_METHODS[0]} className={inputClass}>
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>{PAYMENT_METHOD_LABEL[m]}</option>
                  ))}
                </select>
                {state?.errors?.method && <p className="mt-1 text-xs text-red-600">{state.errors.method[0]}</p>}
              </div>
              <div>
                <label className={labelClass}>Periyot</label>
                <select name="period" defaultValue={payment?.period ?? "ONE_TIME"} className={inputClass}>
                  {PAYMENT_PERIODS.map((p) => (
                    <option key={p} value={p}>{PAYMENT_PERIOD_LABEL[p]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  Vade Tarihi <span className="font-normal text-slate-400 dark:text-slate-500">(opsiyonel)</span>
                </label>
                <input name="dueDate" type="date" defaultValue={toDateInputValue(payment?.dueDate)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>
                  Tahsil Tarihi <span className="font-normal text-slate-400 dark:text-slate-500">(opsiyonel)</span>
                </label>
                <input name="paidAt" type="date" defaultValue={toDateInputValue(payment?.paidAt)} className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Not</label>
              <textarea name="notes" rows={3} defaultValue={payment?.notes ?? ""} className={inputClass} />
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

export default function PaymentsPanel({ contactId, payments }: { contactId: string; payments: PaymentRow[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentRow | null>(null);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Ödeme Ekle
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Tutar</th>
              <th className="px-4 py-3">Tip</th>
              <th className="px-4 py-3">Periyot</th>
              <th className="px-4 py-3">Vade / Tahsil</th>
              <th className="px-4 py-3 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                  Henüz ödeme kaydı yok.
                </td>
              </tr>
            )}
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">
                  {Number(p.amount).toLocaleString("tr-TR")} {p.currency}
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{PAYMENT_METHOD_LABEL[p.method]}</td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{PAYMENT_PERIOD_LABEL[p.period]}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500 dark:text-slate-400">
                  {p.paidAt ? (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Tahsil: {new Date(p.paidAt).toLocaleDateString("tr-TR")}
                    </span>
                  ) : p.dueDate ? (
                    <span>Vade: {new Date(p.dueDate).toLocaleDateString("tr-TR")}</span>
                  ) : (
                    "—"
                  )}
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
                      action={deletePayment.bind(null, p.id, contactId)}
                      confirmMessage="Bu ödeme kaydı silinsin mi?"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PaymentModal key={editing?.id ?? "new"} contactId={contactId} open={modalOpen} onOpenChange={setModalOpen} payment={editing} />
    </div>
  );
}
