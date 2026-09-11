"use client";

import { useActionState, useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { createPortfolioContact } from "@/modules/portfolio/actions";
import { NEW_PORTFOLIO_STATUS_VALUE, PORTFOLIO_CHANNEL_LABEL, type PortfolioFormState } from "@/modules/portfolio/schema";
import { toDateInputValue } from "@/lib/utils";
import type { PortfolioChannel } from "@/lib/generated/prisma/client";

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20";
const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300";

/**
 * Tablo hücresindeki "+" ile açılır — müşteri (customerId) ve kanal
 * (channel) zaten hücreden belli olduğu için burada seçici YOK.
 */
export default function PortfolioContactModal({
  open,
  onOpenChange,
  customerId,
  customerName,
  channel,
  statuses,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  customerName: string;
  channel: PortfolioChannel;
  statuses: { id: string; name: string }[];
  onSaved?: () => void;
}) {
  const action = createPortfolioContact.bind(null, customerId, channel) as (
    state: PortfolioFormState,
    formData: FormData
  ) => Promise<PortfolioFormState>;
  const [state, formAction, pending] = useActionState(action, undefined);
  const [statusValue, setStatusValue] = useState("");

  useEffect(() => {
    if (state?.success) {
      onOpenChange(false);
      onSaved?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.success]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-900/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(480px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <Dialog.Title className="text-lg font-extrabold text-slate-900 dark:text-white">
                {PORTFOLIO_CHANNEL_LABEL[channel]} — Temas Kaydı
              </Dialog.Title>
              <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{customerName}</p>
            </div>
            <Dialog.Close className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-slate-200">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <form action={formAction} className="flex flex-col gap-4">
            <div>
              <label className={labelClass}>Görüşme Tarihi</label>
              <input
                name="contactedAt"
                type="date"
                defaultValue={toDateInputValue(new Date())}
                className={inputClass}
                required
              />
              {state?.errors?.contactedAt && <p className="mt-1 text-xs text-red-600">{state.errors.contactedAt[0]}</p>}
            </div>

            <div>
              <label className={labelClass}>Toplantı Notları</label>
              <textarea name="notes" rows={3} className={inputClass} required />
              {state?.errors?.notes && <p className="mt-1 text-xs text-red-600">{state.errors.notes[0]}</p>}
            </div>

            <div>
              <label className={labelClass}>
                Not &amp; Açıklama <span className="font-normal text-slate-400 dark:text-slate-500">(opsiyonel)</span>
              </label>
              <textarea name="remarks" rows={2} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Durum</label>
              <select
                name="statusId"
                value={statusValue}
                onChange={(e) => setStatusValue(e.target.value)}
                className={inputClass}
              >
                <option value="">— Seçilmedi —</option>
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
                <option value={NEW_PORTFOLIO_STATUS_VALUE}>+ Yeni durum ekle</option>
              </select>
              {statusValue === NEW_PORTFOLIO_STATUS_VALUE && (
                <input
                  name="newStatusName"
                  placeholder="Yeni durum adı"
                  className={`${inputClass} mt-2`}
                  autoFocus
                  required
                />
              )}
              {state?.errors?.statusId && <p className="mt-1 text-xs text-red-600">{state.errors.statusId[0]}</p>}
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
                {pending ? "Kaydediliyor…" : "Ekle"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
