"use client";

import { useActionState } from "react";
import { ICON_NAMES } from "@/lib/icon-map";
import { COLOR_THEME_NAMES } from "@/lib/color-theme";
import { PRICING_CURRENCIES, type ServiceFormState, type SubService } from "@/modules/services/schema";
import SubServiceRepeater from "@/components/admin/SubServiceRepeater";
import type { Service } from "@/lib/generated/prisma/client";

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20";

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
  const initialSubServices = Array.isArray(service?.subServices)
    ? (service.subServices as unknown as SubService[])
    : [];

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Başlık</label>
          <input name="title" defaultValue={service?.title} className={inputClass} required />
          {state?.errors?.title && <p className="mt-1 text-xs text-red-600">{state.errors.title[0]}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Slug <span className="font-normal text-slate-400 dark:text-slate-500">(URL için, benzersiz)</span>
          </label>
          <input name="slug" defaultValue={service?.slug} className={inputClass} required />
          {state?.errors?.slug && <p className="mt-1 text-xs text-red-600">{state.errors.slug[0]}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Etiket (kategori adı)</label>
        <input name="tag" defaultValue={service?.tag} className={inputClass} required />
        {state?.errors?.tag && <p className="mt-1 text-xs text-red-600">{state.errors.tag[0]}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Açıklama</label>
        <textarea name="description" rows={3} defaultValue={service?.description} className={inputClass} />
        {state?.errors?.description && <p className="mt-1 text-xs text-red-600">{state.errors.description[0]}</p>}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">İkon</label>
          <select name="icon" defaultValue={service?.icon ?? "Code2"} className={inputClass}>
            {ICON_NAMES.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Renk Teması</label>
          <select name="colorTheme" defaultValue={service?.colorTheme ?? "blue"} className={inputClass}>
            {COLOR_THEME_NAMES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Sıra</label>
          <input type="number" name="sortOrder" defaultValue={service?.sortOrder ?? 0} className={inputClass} />
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-500/5 p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
            Alt Hizmetler
          </p>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400" title="Fiyat sadece admin panelinde görünür">
              🔒 Fiyat Para Birimi:
            </label>
            <select
              name="pricingCurrency"
              defaultValue={service?.pricingCurrency ?? "TRY"}
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs text-slate-900 dark:text-white"
            >
              {PRICING_CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
          Ad ve açıklama public /services sayfasında gösterilir. Fiyat web sitesinde asla gösterilmez, sadece bu panelde görünür.
        </p>
        <SubServiceRepeater name="subServicesJson" initial={initialSubServices} />
        {state?.errors?.subServicesJson && (
          <p className="mt-2 text-xs text-red-600">{state.errors.subServicesJson[0]}</p>
        )}
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
