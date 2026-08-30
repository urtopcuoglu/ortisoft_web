"use client";

import { useActionState } from "react";
import type { CareerPostingFormState } from "@/modules/career/schema";
import type { CareerPosting } from "@/lib/generated/prisma/client";

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20";

type Action = (
  state: CareerPostingFormState,
  formData: FormData
) => Promise<CareerPostingFormState>;

export default function CareerPostingForm({
  action,
  posting,
  submitLabel = "Kaydet",
}: {
  action: Action;
  posting?: CareerPosting;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const requirementsText = Array.isArray(posting?.requirements)
    ? (posting.requirements as string[]).join("\n")
    : "";

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">İlan Başlığı</label>
          <input name="title" defaultValue={posting?.title} className={inputClass} required />
          {state?.errors?.title && <p className="mt-1 text-xs text-red-600">{state.errors.title[0]}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Slug <span className="font-normal text-slate-400 dark:text-slate-500">(URL için, benzersiz)</span>
          </label>
          <input name="slug" defaultValue={posting?.slug} className={inputClass} required />
          {state?.errors?.slug && <p className="mt-1 text-xs text-red-600">{state.errors.slug[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Konum</label>
          <input
            name="location"
            defaultValue={posting?.location}
            placeholder="İstanbul (Hibrit)"
            className={inputClass}
            required
          />
          {state?.errors?.location && <p className="mt-1 text-xs text-red-600">{state.errors.location[0]}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Çalışma Şekli</label>
          <input
            name="employmentType"
            defaultValue={posting?.employmentType}
            placeholder="Tam Zamanlı"
            className={inputClass}
            required
          />
          {state?.errors?.employmentType && <p className="mt-1 text-xs text-red-600">{state.errors.employmentType[0]}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Açıklama</label>
        <textarea name="description" rows={3} defaultValue={posting?.description} className={inputClass} />
        {state?.errors?.description && <p className="mt-1 text-xs text-red-600">{state.errors.description[0]}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Gereksinimler <span className="font-normal text-slate-400 dark:text-slate-500">(her satıra bir tane)</span>
        </label>
        <textarea name="requirements" rows={5} defaultValue={requirementsText} className={inputClass} />
        {state?.errors?.requirements && <p className="mt-1 text-xs text-red-600">{state.errors.requirements[0]}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Başvuru E-postası</label>
          <input
            name="applyEmail"
            type="email"
            defaultValue={posting?.applyEmail}
            className={inputClass}
            required
          />
          {state?.errors?.applyEmail && <p className="mt-1 text-xs text-red-600">{state.errors.applyEmail[0]}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Durum</label>
          <select name="status" defaultValue={posting?.status ?? "DRAFT"} className={inputClass}>
            <option value="DRAFT">Taslak</option>
            <option value="PUBLISHED">Yayında</option>
            <option value="CLOSED">Kapalı</option>
          </select>
        </div>
      </div>

      {state?.success && (
        <p className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 px-3.5 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">Kaydedildi.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Kaydediliyor…" : submitLabel}
      </button>
    </form>
  );
}
