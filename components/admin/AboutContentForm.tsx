"use client";

import { useActionState } from "react";
import { updateAboutContent } from "@/modules/about/actions";
import type { AboutContent } from "@/lib/generated/prisma/client";

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20";

export default function AboutContentForm({
  content,
}: {
  content: AboutContent | null;
}) {
  const [state, formAction, pending] = useActionState(
    updateAboutContent,
    undefined
  );

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Hero Başlığı
        </label>
        <input
          name="heroTitle"
          defaultValue={content?.heroTitle ?? "Hakkımızda"}
          className={inputClass}
        />
        {state?.errors?.heroTitle && (
          <p className="mt-1 text-xs text-red-600">{state.errors.heroTitle[0]}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Hero Alt Başlığı
        </label>
        <textarea
          name="heroSubtitle"
          rows={2}
          defaultValue={content?.heroSubtitle ?? ""}
          className={inputClass}
        />
        {state?.errors?.heroSubtitle && (
          <p className="mt-1 text-xs text-red-600">{state.errors.heroSubtitle[0]}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Hakkımızda Yazısı
        </label>
        <textarea
          name="aboutText"
          rows={5}
          defaultValue={content?.aboutText ?? ""}
          className={inputClass}
        />
        {state?.errors?.aboutText && (
          <p className="mt-1 text-xs text-red-600">{state.errors.aboutText[0]}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Misyon
        </label>
        <textarea
          name="missionText"
          rows={4}
          defaultValue={content?.missionText ?? ""}
          className={inputClass}
        />
        {state?.errors?.missionText && (
          <p className="mt-1 text-xs text-red-600">{state.errors.missionText[0]}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Vizyon
        </label>
        <textarea
          name="visionText"
          rows={4}
          defaultValue={content?.visionText ?? ""}
          className={inputClass}
        />
        {state?.errors?.visionText && (
          <p className="mt-1 text-xs text-red-600">{state.errors.visionText[0]}</p>
        )}
      </div>

      {state?.success && (
        <p className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 px-3.5 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
          {state.message ?? "Kaydedildi."}
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
