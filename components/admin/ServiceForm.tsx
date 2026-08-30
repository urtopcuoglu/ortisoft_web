"use client";

import { useActionState } from "react";
import { ICON_NAMES } from "@/lib/icon-map";
import { COLOR_THEME_NAMES } from "@/lib/color-theme";
import type { ServiceFormState } from "@/modules/services/schema";
import type { Service } from "@/lib/generated/prisma/client";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

type Action = (
  state: ServiceFormState,
  formData: FormData
) => Promise<ServiceFormState>;

export default function ServiceForm({
  action,
  service,
  submitLabel = "Kaydet",
}: {
  action: Action;
  service?: Service;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const featuresText = Array.isArray(service?.features)
    ? (service.features as string[]).join("\n")
    : "";

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Başlık</label>
          <input name="title" defaultValue={service?.title} className={inputClass} required />
          {state?.errors?.title && <p className="mt-1 text-xs text-red-600">{state.errors.title[0]}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Slug <span className="font-normal text-slate-400">(URL için, benzersiz)</span>
          </label>
          <input name="slug" defaultValue={service?.slug} className={inputClass} required />
          {state?.errors?.slug && <p className="mt-1 text-xs text-red-600">{state.errors.slug[0]}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">Etiket (kategori adı)</label>
        <input name="tag" defaultValue={service?.tag} className={inputClass} required />
        {state?.errors?.tag && <p className="mt-1 text-xs text-red-600">{state.errors.tag[0]}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">Açıklama</label>
        <textarea name="description" rows={3} defaultValue={service?.description} className={inputClass} />
        {state?.errors?.description && <p className="mt-1 text-xs text-red-600">{state.errors.description[0]}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
          Özellikler <span className="font-normal text-slate-400">(her satıra bir tane)</span>
        </label>
        <textarea name="features" rows={5} defaultValue={featuresText} className={inputClass} />
        {state?.errors?.features && <p className="mt-1 text-xs text-red-600">{state.errors.features[0]}</p>}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">İkon</label>
          <select name="icon" defaultValue={service?.icon ?? "Code2"} className={inputClass}>
            {ICON_NAMES.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Renk Teması</label>
          <select name="colorTheme" defaultValue={service?.colorTheme ?? "blue"} className={inputClass}>
            {COLOR_THEME_NAMES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Sıra</label>
          <input type="number" name="sortOrder" defaultValue={service?.sortOrder ?? 0} className={inputClass} />
        </div>
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
