"use client";

import { useActionState } from "react";
import type { ReferenceFormState } from "@/modules/references/schema";
import type { Reference } from "@/lib/generated/prisma/client";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

type Action = (
  state: ReferenceFormState,
  formData: FormData
) => Promise<ReferenceFormState>;

export default function ReferenceForm({
  action,
  reference,
  submitLabel = "Kaydet",
}: {
  action: Action;
  reference?: Reference;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-5">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">Marka / Müşteri Adı</label>
        <input name="clientName" defaultValue={reference?.clientName} className={inputClass} required />
        {state?.errors?.clientName && <p className="mt-1 text-xs text-red-600">{state.errors.clientName[0]}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">Açıklama</label>
        <textarea name="description" rows={2} defaultValue={reference?.description} className={inputClass} />
        {state?.errors?.description && <p className="mt-1 text-xs text-red-600">{state.errors.description[0]}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Logo URL&apos;si <span className="font-normal text-slate-400">(boş bırakılabilir)</span>
          </label>
          <input name="logoUrl" defaultValue={reference?.logoUrl ?? ""} className={inputClass} />
          {state?.errors?.logoUrl && <p className="mt-1 text-xs text-red-600">{state.errors.logoUrl[0]}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Proje/Site Linki</label>
          <input name="projectLink" defaultValue={reference?.projectLink ?? ""} className={inputClass} />
          {state?.errors?.projectLink && <p className="mt-1 text-xs text-red-600">{state.errors.projectLink[0]}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">Sıra</label>
        <input type="number" name="sortOrder" defaultValue={reference?.sortOrder ?? 0} className={inputClass} />
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
