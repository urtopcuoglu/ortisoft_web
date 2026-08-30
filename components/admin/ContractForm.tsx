"use client";

import { useActionState } from "react";
import RichTextEditor from "@/components/admin/RichTextEditor";
import type { ContractFormState } from "@/modules/contracts/schema";
import type { Contract } from "@/lib/generated/prisma/client";

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20";

type Action = (
  state: ContractFormState,
  formData: FormData
) => Promise<ContractFormState>;

export default function ContractForm({
  action,
  contract,
  submitLabel = "Kaydet",
}: {
  action: Action;
  contract?: Contract;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Başlık</label>
          <input name="title" defaultValue={contract?.title} className={inputClass} required />
          {state?.errors?.title && <p className="mt-1 text-xs text-red-600">{state.errors.title[0]}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Slug <span className="font-normal text-slate-400 dark:text-slate-500">(URL: /contracts/…)</span>
          </label>
          <input name="slug" defaultValue={contract?.slug} className={inputClass} required />
          {state?.errors?.slug && <p className="mt-1 text-xs text-red-600">{state.errors.slug[0]}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">İçerik</label>
        <RichTextEditor name="content" defaultValue={contract?.content} />
        {state?.errors?.content && <p className="mt-1 text-xs text-red-600">{state.errors.content[0]}</p>}
      </div>

      <div className="w-40">
        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Sıra <span className="font-normal text-slate-400 dark:text-slate-500">(Footer&apos;da)</span>
        </label>
        <input type="number" name="sortOrder" defaultValue={contract?.sortOrder ?? 0} className={inputClass} />
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
