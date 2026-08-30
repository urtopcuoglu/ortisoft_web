"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "@/components/LocaleProvider";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export default function LocaleSwitcher({ dark = false }: { dark?: boolean }) {
  const router = useRouter();
  const { locale } = useTranslations();

  function switchTo(next: Locale) {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  const base = "px-1.5 py-0.5 text-xs font-bold rounded transition-colors";
  const activeClass = dark ? "text-white" : "text-blue-600";
  const inactiveClass = dark ? "text-white/50 hover:text-white/80" : "text-slate-400 hover:text-slate-600";

  return (
    <div className="flex items-center gap-0.5" aria-label="Dil seçimi / Language">
      <button type="button" onClick={() => switchTo("tr")} className={cn(base, locale === "tr" ? activeClass : inactiveClass)}>
        TR
      </button>
      <span className={dark ? "text-white/30" : "text-slate-300"}>/</span>
      <button type="button" onClick={() => switchTo("en")} className={cn(base, locale === "en" ? activeClass : inactiveClass)}>
        EN
      </button>
    </div>
  );
}
