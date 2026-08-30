"use client";

import { useActionState } from "react";
import { ICON_NAMES } from "@/lib/icon-map";
import { COLOR_THEME_NAMES } from "@/lib/color-theme";
import type { ProjectFormState } from "@/modules/projects/schema";
import type { Project } from "@/lib/generated/prisma/client";

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20";

type Action = (
  state: ProjectFormState,
  formData: FormData
) => Promise<ProjectFormState>;

function toLines(value: unknown): string {
  return Array.isArray(value) ? (value as string[]).join("\n") : "";
}

export default function ProjectForm({
  action,
  project,
  submitLabel = "Kaydet",
}: {
  action: Action;
  project?: Project;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Başlık</label>
          <input name="title" defaultValue={project?.title} className={inputClass} required />
          {state?.errors?.title && <p className="mt-1 text-xs text-red-600">{state.errors.title[0]}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Slug <span className="font-normal text-slate-400 dark:text-slate-500">(benzersiz)</span>
          </label>
          <input name="slug" defaultValue={project?.slug} className={inputClass} required />
          {state?.errors?.slug && <p className="mt-1 text-xs text-red-600">{state.errors.slug[0]}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Tagline</label>
        <input name="tagline" defaultValue={project?.tagline} className={inputClass} required />
        {state?.errors?.tagline && <p className="mt-1 text-xs text-red-600">{state.errors.tagline[0]}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Açıklama</label>
        <textarea name="description" rows={3} defaultValue={project?.description} className={inputClass} />
        {state?.errors?.description && <p className="mt-1 text-xs text-red-600">{state.errors.description[0]}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Özellikler <span className="font-normal text-slate-400 dark:text-slate-500">(her satıra bir tane)</span>
        </label>
        <textarea name="features" rows={4} defaultValue={toLines(project?.features)} className={inputClass} />
        {state?.errors?.features && <p className="mt-1 text-xs text-red-600">{state.errors.features[0]}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Etiketler <span className="font-normal text-slate-400 dark:text-slate-500">(her satıra bir tane)</span>
        </label>
        <textarea name="tags" rows={2} defaultValue={toLines(project?.tags)} className={inputClass} />
        {state?.errors?.tags && <p className="mt-1 text-xs text-red-600">{state.errors.tags[0]}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Teknoloji Yığını <span className="font-normal text-slate-400 dark:text-slate-500">(opsiyonel, her satıra bir tane)</span>
        </label>
        <textarea name="techStack" rows={3} defaultValue={toLines(project?.techStack)} className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Fon / Kaynak Etiketi</label>
          <input
            name="fundingLabel"
            defaultValue={project?.fundingLabel}
            placeholder="Ortisoft Girişimi"
            className={inputClass}
            required
          />
          {state?.errors?.fundingLabel && <p className="mt-1 text-xs text-red-600">{state.errors.fundingLabel[0]}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Durum</label>
          <select name="status" defaultValue={project?.status ?? "COMING_SOON"} className={inputClass}>
            <option value="COMING_SOON">Çok Yakında</option>
            <option value="IN_DEVELOPMENT">Geliştiriliyor</option>
            <option value="ACTIVE">Aktif</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">İkon</label>
          <select name="icon" defaultValue={project?.icon ?? "Rocket"} className={inputClass}>
            {ICON_NAMES.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Renk Teması</label>
          <select name="colorTheme" defaultValue={project?.colorTheme ?? "blue"} className={inputClass}>
            {COLOR_THEME_NAMES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Sıra</label>
          <input type="number" name="sortOrder" defaultValue={project?.sortOrder ?? 0} className={inputClass} />
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
