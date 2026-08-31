"use client";

import { useActionState, useState } from "react";
import SeoAnalyzer from "@/components/admin/SeoAnalyzer";
import type { PageSeoFormState } from "@/modules/pages/schema";

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20";

type Action = (state: PageSeoFormState, formData: FormData) => Promise<PageSeoFormState>;

export default function PageSeoForm({
  action,
  label,
  route,
  page,
}: {
  action: Action;
  label: string;
  route: string;
  page: { seoTitle: string | null; seoDescription: string | null; seoKeywords: string | null } | null;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  // SEO Analiz Aracı'nın canlı güncellenmesi için lift edilen alanlar
  // (bkz. BlogPostForm.tsx — aynı desen).
  const [seoTitle, setSeoTitle] = useState(page?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(page?.seoDescription ?? "");
  const [seoKeywords, setSeoKeywords] = useState(page?.seoKeywords ?? "");
  // Odak anahtar kelime ayrı bir alan değil — analiz aracı için anahtar
  // kelimeler listesinin ilkini kullanıyoruz (varsa).
  const focusKeyword = seoKeywords.split(",")[0]?.trim() ?? "";

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
      <form action={formAction} className="flex max-w-xl flex-col gap-5">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Meta Başlık (title) <span className="font-normal text-slate-400 dark:text-slate-500">(boşsa &quot;{label} | Ortisoft&quot; kullanılır)</span>
          </label>
          <input
            name="seoTitle"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            className={inputClass}
            placeholder={`${label} | Ortisoft`}
          />
          {state?.errors?.seoTitle && <p className="mt-1 text-xs text-red-600">{state.errors.seoTitle[0]}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Meta Açıklama (description)</label>
          <textarea
            name="seoDescription"
            rows={3}
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            className={inputClass}
          />
          {state?.errors?.seoDescription && <p className="mt-1 text-xs text-red-600">{state.errors.seoDescription[0]}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Meta Anahtar Kelimeler (keywords) <span className="font-normal text-slate-400 dark:text-slate-500">(virgülle ayır)</span>
          </label>
          <input
            name="seoKeywords"
            value={seoKeywords}
            onChange={(e) => setSeoKeywords(e.target.value)}
            className={inputClass}
            placeholder="yazılım danışmanlığı, dijital dönüşüm, ..."
          />
          {state?.errors?.seoKeywords && <p className="mt-1 text-xs text-red-600">{state.errors.seoKeywords[0]}</p>}
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Not: Google bu etiketi artık sıralamada kullanmıyor, sadece bazı diğer arama motorları/araçlar için saklanır.
          </p>
        </div>

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

      <div className="xl:sticky xl:top-6 xl:self-start">
        <SeoAnalyzer
          path={route.replace(/^\//, "") || "/"}
          title={label}
          seoTitle={seoTitle}
          description={seoDescription}
          focusKeyword={focusKeyword}
          slug={route}
        />
      </div>
    </div>
  );
}
