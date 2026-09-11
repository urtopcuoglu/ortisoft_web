"use client";

import { useState, useTransition } from "react";
import { setPortfolioCustomerActive } from "@/modules/portfolio/actions";

/**
 * Elle yapılmış Tailwind switch — @radix-ui/react-switch yeni bir bağımlılık
 * eklemeye gerek bırakmayacak kadar basit iki-durumlu bir kontrol
 * (bkz. plan dokümanı). Optimistic: tıklanır tıklanmaz görsel değişir,
 * sunucu çağrısı arka planda gider.
 */
export default function PortfolioActiveToggle({ customerId, isActive }: { customerId: string; isActive: boolean }) {
  const [active, setActive] = useState(isActive);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !active;
    setActive(next);
    startTransition(() => {
      setPortfolioCustomerActive(customerId, next);
    });
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={active}
        disabled={pending}
        onClick={toggle}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
          active ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            active ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{active ? "Aktif" : "Pasif"}</span>
    </div>
  );
}
