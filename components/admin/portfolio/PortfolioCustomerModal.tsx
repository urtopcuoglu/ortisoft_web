"use client";

import { useActionState, useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { createPortfolioCustomer, updatePortfolioCustomer } from "@/modules/portfolio/actions";
import type { PortfolioFormState } from "@/modules/portfolio/schema";
import RichTextEditor from "@/components/admin/RichTextEditor";

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20";
const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300";

export type PortfolioCustomerForEdit = {
  id: string;
  companyName: string;
  authorizedPerson: string;
  serviceId: string | null;
  description: string | null;
  address: string | null;
  companyEmail: string | null;
  companyPhone: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  fileName: string | null;
};

// Mesajlar sayfasından "Potansiyel Müşteriye Ekle" ile önceden doldurma —
// SADECE create'te kullanılan varsayılan değerler, `customer` prop'undan
// (isEdit'i belirleyen) bilinçli olarak AYRI tutulur.
export type PortfolioCustomerPrefill = {
  companyName?: string;
  authorizedPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  description?: string;
};

export default function PortfolioCustomerModal({
  open,
  onOpenChange,
  services,
  customer,
  prefill,
  sourceMessageId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  services: { id: string; title: string }[];
  customer?: PortfolioCustomerForEdit | null;
  prefill?: PortfolioCustomerPrefill;
  sourceMessageId?: string;
  onSaved?: () => void;
}) {
  const isEdit = !!customer;
  const action = isEdit
    ? (updatePortfolioCustomer.bind(null, customer.id) as (
        state: PortfolioFormState,
        formData: FormData
      ) => Promise<PortfolioFormState>)
    : createPortfolioCustomer;
  const [state, formAction, pending] = useActionState(action, undefined);

  const [serviceId, setServiceId] = useState(customer?.serviceId ?? "");

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
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-900/50 data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(680px,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
          <div className="mb-5 flex items-center justify-between">
            <Dialog.Title className="text-lg font-extrabold text-slate-900 dark:text-white">
              {isEdit ? "Müşteri Kaydını Düzenle" : "Yeni Müşteri Ekle"}
            </Dialog.Title>
            <Dialog.Close className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-slate-200">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <form action={formAction} encType="multipart/form-data" className="flex flex-col gap-4">
            {sourceMessageId && <input type="hidden" name="sourceMessageId" value={sourceMessageId} />}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Firma Adı</label>
                <input
                  name="companyName"
                  defaultValue={customer?.companyName ?? prefill?.companyName ?? ""}
                  className={inputClass}
                  required
                />
                {state?.errors?.companyName && <p className="mt-1 text-xs text-red-600">{state.errors.companyName[0]}</p>}
              </div>
              <div>
                <label className={labelClass}>Yetkili Kişi</label>
                <input
                  name="authorizedPerson"
                  defaultValue={customer?.authorizedPerson ?? prefill?.authorizedPerson ?? ""}
                  className={inputClass}
                  required
                />
                {state?.errors?.authorizedPerson && (
                  <p className="mt-1 text-xs text-red-600">{state.errors.authorizedPerson[0]}</p>
                )}
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Sağlanacak Hizmet <span className="font-normal text-slate-400 dark:text-slate-500">(opsiyonel)</span>
              </label>
              <select
                name="serviceId"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className={inputClass}
              >
                <option value="">— Seçilmedi —</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            {serviceId && (
              <div>
                <label className={labelClass}>Açıklama</label>
                <RichTextEditor name="description" defaultValue={customer?.description ?? prefill?.description ?? ""} />
              </div>
            )}

            <div>
              <label className={labelClass}>
                Dosya <span className="font-normal text-slate-400 dark:text-slate-500">(PDF/DOC/DOCX/XLS/XLSX/CSV, maks. 20MB)</span>
              </label>
              <input
                name="file"
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
                className="block w-full text-sm text-slate-600 dark:text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 dark:file:bg-slate-800 file:px-3.5 file:py-2 file:text-sm file:font-semibold file:text-slate-700 dark:file:text-slate-200"
              />
              {customer?.fileName && (
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  Mevcut dosya: {customer.fileName} — yeni dosya seçerseniz bununla değişir.
                </p>
              )}
              {state?.errors?.file && <p className="mt-1 text-xs text-red-600">{state.errors.file[0]}</p>}
            </div>

            <div>
              <label className={labelClass}>Firma Adresi</label>
              <textarea name="address" rows={2} defaultValue={customer?.address ?? ""} className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Firma E-posta</label>
                <input
                  name="companyEmail"
                  type="email"
                  defaultValue={customer?.companyEmail ?? ""}
                  className={inputClass}
                />
                {state?.errors?.companyEmail && <p className="mt-1 text-xs text-red-600">{state.errors.companyEmail[0]}</p>}
              </div>
              <div>
                <label className={labelClass}>Firma Telefon</label>
                <input name="companyPhone" type="tel" defaultValue={customer?.companyPhone ?? ""} className={inputClass} />
              </div>
            </div>

            <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-700 p-3.5">
              <p className="mb-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Yetkili kişinin kendi iletişim bilgileri <span className="font-normal">(opsiyonel)</span>
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>E-posta</label>
                  <input
                    name="contactEmail"
                    type="email"
                    defaultValue={customer?.contactEmail ?? prefill?.contactEmail ?? ""}
                    className={inputClass}
                  />
                  {state?.errors?.contactEmail && <p className="mt-1 text-xs text-red-600">{state.errors.contactEmail[0]}</p>}
                </div>
                <div>
                  <label className={labelClass}>Telefon</label>
                  <input
                    name="contactPhone"
                    type="tel"
                    defaultValue={customer?.contactPhone ?? prefill?.contactPhone ?? ""}
                    className={inputClass}
                  />
                </div>
              </div>
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
                {pending ? "Kaydediliyor…" : isEdit ? "Kaydet" : "Ekle"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
