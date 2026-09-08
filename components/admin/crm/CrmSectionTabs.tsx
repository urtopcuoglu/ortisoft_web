"use client";

import { useState, type ReactNode } from "react";
import { Building2, Sparkles } from "lucide-react";

type Tab = "companies" | "influencer";

/**
 * Rehber/CRM sayfasının üst sekmesi — "Firmalar" (mevcut GuideTable) ve
 * "Influencer" (yeni modül) arasında geçiş yapar. Aktif olmayan sekme
 * ClientDetailTabs'teki gibi unmount edilir (yeniden mount'ta filtre/arama
 * state'i sıfırlanır — kabul edilebilir, sekmeler arası state paylaşımı
 * istenmiyor).
 */
export default function CrmSectionTabs({
  companiesCount,
  influencerCount,
  companies,
  influencer,
}: {
  companiesCount: number;
  influencerCount: number;
  companies: ReactNode;
  influencer: ReactNode;
}) {
  const [tab, setTab] = useState<Tab>("companies");

  return (
    <div>
      <div className="mb-5 flex gap-1 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setTab("companies")}
          className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
            tab === "companies"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Building2 className="h-4 w-4" /> Firmalar{" "}
          <span className="text-xs font-normal text-slate-400 dark:text-slate-500">({companiesCount})</span>
        </button>
        <button
          type="button"
          onClick={() => setTab("influencer")}
          className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
            tab === "influencer"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Sparkles className="h-4 w-4" /> Influencer{" "}
          <span className="text-xs font-normal text-slate-400 dark:text-slate-500">({influencerCount})</span>
        </button>
      </div>

      {tab === "companies" ? companies : influencer}
    </div>
  );
}
