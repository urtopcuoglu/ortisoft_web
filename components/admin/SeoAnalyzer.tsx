"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const TITLE_MIN = 50;
const TITLE_MAX = 60;
const DESC_MIN = 150;
const DESC_MAX = 160;

function counterColor(len: number, min: number, max: number) {
  if (len === 0) return "text-slate-400 dark:text-slate-500";
  if (len < min || len > max) return "text-amber-600 dark:text-amber-400";
  return "text-emerald-600 dark:text-emerald-400";
}

function CheckRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {ok ? (
        <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500 dark:text-emerald-400" />
      ) : (
        <XCircle className="h-3.5 w-3.5 flex-shrink-0 text-slate-300 dark:text-slate-600" />
      )}
      <span className={ok ? "text-slate-600 dark:text-slate-300" : "text-slate-400 dark:text-slate-500"}>{label}</span>
    </div>
  );
}

/**
 * Google'ın resmi bir "meta doğrulama API"si yok — Yoast/Rank Math gibi
 * araçların yaptığı gibi bu, Google'ın yayınladığı en iyi pratikleri
 * (karakter/piksel sınırı, anahtar kelime kullanımı) kural olarak uygulayan,
 * kural-tabanlı bir analizdir. Bkz. plan dokümanı Bölüm 3.4.
 */
export default function SeoAnalyzer({
  siteUrl = "ortisoft.com.tr",
  path,
  title,
  seoTitle,
  description,
  focusKeyword,
  slug,
}: {
  siteUrl?: string;
  path: string;
  title: string;
  seoTitle: string;
  description: string;
  focusKeyword: string;
  slug: string;
}) {
  const effectiveTitle = seoTitle || title;
  const titleLen = effectiveTitle.length;
  const descLen = description.length;

  const keyword = focusKeyword.trim().toLowerCase();
  const hasKeyword = keyword.length > 0;
  const keywordInTitle = hasKeyword && effectiveTitle.toLowerCase().includes(keyword);
  const keywordInDescription = hasKeyword && description.toLowerCase().includes(keyword);
  const keywordInSlug = hasKeyword && slug.toLowerCase().includes(keyword.replace(/\s+/g, "-"));

  const checks = [
    { ok: titleLen >= TITLE_MIN && titleLen <= TITLE_MAX, label: "Başlık uzunluğu ideal aralıkta (50-60)" },
    { ok: descLen >= DESC_MIN && descLen <= DESC_MAX, label: "Açıklama uzunluğu ideal aralıkta (150-160)" },
    { ok: hasKeyword, label: "Odak anahtar kelime girildi" },
    { ok: keywordInTitle, label: "Anahtar kelime başlıkta geçiyor" },
    { ok: keywordInDescription, label: "Anahtar kelime açıklamada geçiyor" },
    { ok: keywordInSlug, label: "Anahtar kelime URL'de (slug) geçiyor" },
  ];
  const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);
  const scoreLabel = score >= 80 ? "İyi" : score >= 50 ? "Geliştirilebilir" : "Zayıf";
  const scoreClass =
    score >= 80
      ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      : score >= 50
        ? "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400"
        : "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400";

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          SEO Analizi (Google Önizlemesi)
        </h3>
        <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", scoreClass)}>
          {scoreLabel} · {score}/100
        </span>
      </div>

      {/* SERP Önizleme */}
      <div className="mb-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <p className="mb-1 truncate text-xs text-slate-500 dark:text-slate-400">
          {siteUrl} › {path}
        </p>
        <p className="mb-1 truncate text-lg text-blue-700 dark:text-blue-400" style={{ maxWidth: "600px" }}>
          {effectiveTitle || "Sayfa başlığı buraya gelecek"}
        </p>
        <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300" style={{ maxWidth: "600px" }}>
          {description || "Meta açıklama buraya gelecek — Google arama sonuçlarında bu metin gösterilir."}
        </p>
      </div>

      {/* Karakter sayaçları */}
      <div className="mb-4 grid grid-cols-2 gap-4 text-xs">
        <div>
          <span className="font-semibold text-slate-600 dark:text-slate-300">SEO Başlık: </span>
          <span className={counterColor(titleLen, TITLE_MIN, TITLE_MAX)}>
            {titleLen} / {TITLE_MAX}
          </span>
        </div>
        <div>
          <span className="font-semibold text-slate-600 dark:text-slate-300">Meta Açıklama: </span>
          <span className={counterColor(descLen, DESC_MIN, DESC_MAX)}>
            {descLen} / {DESC_MAX}
          </span>
        </div>
      </div>

      {/* Kontrol listesi */}
      <div className="flex flex-col gap-1.5">
        {checks.map((c) => (
          <CheckRow key={c.label} ok={c.ok} label={c.label} />
        ))}
      </div>
    </div>
  );
}
