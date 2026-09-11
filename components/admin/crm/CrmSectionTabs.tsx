"use client";

import { useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { Building2, KanbanSquare, Sparkles } from "lucide-react";

type Tab = "companies" | "influencer" | "tasks";

/**
 * Rehber/CRM sayfasının üst sekmesi — "Firmalar" (mevcut GuideTable),
 * "Influencer" ve "Görev Yönetimi" (Trello-lite Kanban/Zaman Çizelgesi,
 * bkz. components/admin/tasks) arasında geçiş yapar. Aktif olmayan sekme
 * ClientDetailTabs'teki gibi unmount edilir (yeniden mount'ta filtre/arama
 * state'i sıfırlanır — kabul edilebilir, sekmeler arası state paylaşımı
 * istenmiyor).
 *
 * Başlangıç sekmesi `?tab=` query param'ından (ya da `?task=` varsa doğrudan
 * "tasks") okunur — görev bildirim çanındaki linkler (bkz.
 * modules/tasks/actions.ts#taskLink) bu sayede doğru sekmeyi açık getirir.
 * (useSearchParams kullanıldığı için çağıran yer Suspense ile sarmalı, bkz.
 * app/(admin)/admin/(protected)/crm/page.tsx.)
 */
export default function CrmSectionTabs({
  companiesCount,
  influencerCount,
  tasksCount,
  companies,
  influencer,
  tasks,
}: {
  companiesCount: number;
  influencerCount: number;
  tasksCount: number;
  companies: ReactNode;
  influencer: ReactNode;
  tasks: ReactNode;
}) {
  const searchParams = useSearchParams();
  const initialTab: Tab =
    searchParams.get("tab") === "tasks" || searchParams.get("tab") === "influencer"
      ? (searchParams.get("tab") as Tab)
      : searchParams.get("task")
        ? "tasks"
        : "companies";
  const [tab, setTab] = useState<Tab>(initialTab);

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
        <button
          type="button"
          onClick={() => setTab("tasks")}
          className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
            tab === "tasks"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <KanbanSquare className="h-4 w-4" /> Görev Yönetimi{" "}
          <span className="text-xs font-normal text-slate-400 dark:text-slate-500">({tasksCount})</span>
        </button>
      </div>

      {tab === "companies" && companies}
      {tab === "influencer" && influencer}
      {tab === "tasks" && tasks}
    </div>
  );
}
