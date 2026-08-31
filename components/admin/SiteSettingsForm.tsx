"use client";

import { useActionState } from "react";
import type { SiteSettingsFormState } from "@/modules/settings/schema";
import type { SiteSettings } from "@/lib/generated/prisma/client";

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20";
const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300";

type Action = (state: SiteSettingsFormState, formData: FormData) => Promise<SiteSettingsFormState>;

export default function SiteSettingsForm({
  action,
  settings,
}: {
  action: Action;
  settings: SiteSettings | null;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-5">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <h2 className="mb-4 text-sm font-bold text-slate-800 dark:text-slate-200">İletişim Bilgileri (Footer)</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>E-posta</label>
            <input name="contactEmail" defaultValue={settings?.contactEmail ?? ""} className={inputClass} placeholder="ornek@ortisoft.com.tr" />
            {state?.errors?.contactEmail && <p className="mt-1 text-xs text-red-600">{state.errors.contactEmail[0]}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Telefon 1</label>
              <input name="contactPhone1" defaultValue={settings?.contactPhone1 ?? ""} className={inputClass} placeholder="+90 5xx xxx xx xx" />
            </div>
            <div>
              <label className={labelClass}>Telefon 2 <span className="font-normal text-slate-400 dark:text-slate-500">(opsiyonel)</span></label>
              <input name="contactPhone2" defaultValue={settings?.contactPhone2 ?? ""} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Adres</label>
            <input name="address" defaultValue={settings?.address ?? ""} className={inputClass} placeholder="Ankara, Türkiye" />
          </div>
          <div>
            <label className={labelClass}>Adres Harita Linki <span className="font-normal text-slate-400 dark:text-slate-500">(opsiyonel, Google Maps vb.)</span></label>
            <input name="addressMapUrl" defaultValue={settings?.addressMapUrl ?? ""} className={inputClass} />
            {state?.errors?.addressMapUrl && <p className="mt-1 text-xs text-red-600">{state.errors.addressMapUrl[0]}</p>}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <h2 className="mb-4 text-sm font-bold text-slate-800 dark:text-slate-200">Sosyal Medya Linkleri (Footer)</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>LinkedIn</label>
            <input name="linkedinUrl" defaultValue={settings?.linkedinUrl ?? ""} className={inputClass} placeholder="https://linkedin.com/company/..." />
            {state?.errors?.linkedinUrl && <p className="mt-1 text-xs text-red-600">{state.errors.linkedinUrl[0]}</p>}
          </div>
          <div>
            <label className={labelClass}>Twitter / X</label>
            <input name="twitterUrl" defaultValue={settings?.twitterUrl ?? ""} className={inputClass} placeholder="https://x.com/..." />
            {state?.errors?.twitterUrl && <p className="mt-1 text-xs text-red-600">{state.errors.twitterUrl[0]}</p>}
          </div>
          <div>
            <label className={labelClass}>GitHub</label>
            <input name="githubUrl" defaultValue={settings?.githubUrl ?? ""} className={inputClass} placeholder="https://github.com/..." />
            {state?.errors?.githubUrl && <p className="mt-1 text-xs text-red-600">{state.errors.githubUrl[0]}</p>}
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-500">
        Not: Menü linkleri ve tagline/CTA metinleri buradan yönetilmiyor — onlar site geneli çoklu dil (TR/EN) sözlüğüne
        bağlı. Bu sayfa sadece gerçekten sabit kodlanmış iletişim/sosyal alanları içerir.
      </p>

      {state?.success && (
        <p className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 px-3.5 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Kaydediliyor…" : "Kaydet"}
      </button>
    </form>
  );
}
