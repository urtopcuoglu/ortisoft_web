"use client";

import { useActionState, useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { createGuideContact, updateGuideContact } from "@/modules/guide/actions";
import {
  GUIDE_RELATION_TYPE_LABEL,
  GUIDE_RELATION_TYPES,
  NEW_CATEGORY_VALUE,
  type GuideContactFormState,
} from "@/modules/guide/schema";

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20";
const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300";

export type GuideContactForEdit = {
  id: string;
  companyName: string;
  authorizedPerson: string;
  categoryId: string;
  phone: string;
  address: string | null;
  email: string;
  website: string | null;
  relatedUserId: string | null;
  relationType: (typeof GUIDE_RELATION_TYPES)[number];
};

export default function GuideContactModal({
  open,
  onOpenChange,
  categories,
  users,
  contact,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: { id: string; name: string }[];
  users: { id: string; name: string }[];
  contact?: GuideContactForEdit | null;
}) {
  const isEdit = !!contact;
  const action = isEdit
    ? (updateGuideContact.bind(null, contact.id) as (
        state: GuideContactFormState,
        formData: FormData
      ) => Promise<GuideContactFormState>)
    : createGuideContact;
  const [state, formAction, pending] = useActionState(action, undefined);

  const [categoryValue, setCategoryValue] = useState(
    contact?.categoryId ?? (categories.length > 0 ? categories[0].id : NEW_CATEGORY_VALUE)
  );

  useEffect(() => {
    if (state?.success) onOpenChange(false);
  }, [state?.success, onOpenChange]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-900/50 data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(640px,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
          <div className="mb-5 flex items-center justify-between">
            <Dialog.Title className="text-lg font-extrabold text-slate-900 dark:text-white">
              {isEdit ? "Rehber Kaydını Düzenle" : "Yeni Rehber Kaydı"}
            </Dialog.Title>
            <Dialog.Close className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-slate-200">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <form action={formAction} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Firma Adı</label>
                <input name="companyName" defaultValue={contact?.companyName} className={inputClass} required />
                {state?.errors?.companyName && (
                  <p className="mt-1 text-xs text-red-600">{state.errors.companyName[0]}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>Yetkili</label>
                <input name="authorizedPerson" defaultValue={contact?.authorizedPerson} className={inputClass} required />
                {state?.errors?.authorizedPerson && (
                  <p className="mt-1 text-xs text-red-600">{state.errors.authorizedPerson[0]}</p>
                )}
              </div>
            </div>

            <div>
              <label className={labelClass}>İşletme Kategorisi</label>
              <select
                name="categoryId"
                value={categoryValue}
                onChange={(e) => setCategoryValue(e.target.value)}
                className={inputClass}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
                <option value={NEW_CATEGORY_VALUE}>+ Yeni kategori ekle</option>
              </select>
              {categoryValue === NEW_CATEGORY_VALUE && (
                <input
                  name="newCategoryName"
                  placeholder="Yeni kategori adı"
                  className={`${inputClass} mt-2`}
                  autoFocus
                  required
                />
              )}
              {state?.errors?.categoryId && (
                <p className="mt-1 text-xs text-red-600">{state.errors.categoryId[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Telefon</label>
                <input name="phone" type="tel" defaultValue={contact?.phone} className={inputClass} required />
                {state?.errors?.phone && <p className="mt-1 text-xs text-red-600">{state.errors.phone[0]}</p>}
              </div>
              <div>
                <label className={labelClass}>E-posta</label>
                <input name="email" type="email" defaultValue={contact?.email} className={inputClass} required />
                {state?.errors?.email && <p className="mt-1 text-xs text-red-600">{state.errors.email[0]}</p>}
              </div>
            </div>

            <div>
              <label className={labelClass}>Adres</label>
              <textarea name="address" rows={2} defaultValue={contact?.address ?? ""} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>
                Web Sitesi <span className="font-normal text-slate-400 dark:text-slate-500">(opsiyonel)</span>
              </label>
              <input
                name="website"
                placeholder="https://..."
                defaultValue={contact?.website ?? ""}
                className={inputClass}
              />
              {state?.errors?.website && <p className="mt-1 text-xs text-red-600">{state.errors.website[0]}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>İlgili Kişi</label>
                <select name="relatedUserId" defaultValue={contact?.relatedUserId ?? ""} className={inputClass}>
                  <option value="">— Seçilmedi —</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>İlişki Türü</label>
                <select
                  name="relationType"
                  defaultValue={contact?.relationType ?? GUIDE_RELATION_TYPES[0]}
                  className={inputClass}
                >
                  {GUIDE_RELATION_TYPES.map((t) => (
                    <option key={t} value={t}>{GUIDE_RELATION_TYPE_LABEL[t]}</option>
                  ))}
                </select>
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
