"use client";

import { useActionState } from "react";
import RichTextEditor from "@/components/admin/RichTextEditor";
import type { ContractFormState } from "@/modules/contracts/schema";
import type { Contract } from "@/lib/generated/prisma/client";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

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
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Başlık</label>
          <input name="title" defaultValue={contract?.title} className={inputClass} required />
          {state?.errors?.title && <p className="mt-1 text-xs text-red-600">{state.errors.title[0]}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Slug <span className="font-normal text-slate-400">(URL: /contracts/…)</span>
          </label>
          <input name="slug" defaultValue={contract?.slug} className={inputClass} required />
          {state?.errors?.slug && <p className="mt-1 text-xs text-red-600">{state.errors.slug[0]}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">İçerik</label>
        <RichTextEditor name="content" defaultValue={contract?.content} />
        {state?.errors?.content && <p className="mt-1 text-xs text-red-600">{state.errors.content[0]}</p>}
      </div>

      <div className="w-40">
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
          Sıra <span className="font-normal text-slate-400">(Footer&apos;da)</span>
        </label>
        <input type="number" name="sortOrder" defaultValue={contract?.sortOrder ?? 0} className={inputClass} />
      </div>

      {state?.success && (
        <p className="rounded-lg bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">Kaydedildi.</p>
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
