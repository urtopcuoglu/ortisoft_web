"use client";

import { useTransition } from "react";
import { ThumbsDown } from "lucide-react";
import { markPortfolioCustomerNegative } from "@/modules/portfolio/actions";

/**
 * Tek yönlü aksiyon (bidirectional switch DEĞİL) — "Olumsuz Statüsüne Çek"
 * durumu Olumsuz yapar + Aktif/Pasif switch'i pasife çeker (bkz.
 * modules/portfolio/actions.ts#markPortfolioCustomerNegative). Reaktivasyon
 * PortfolioActiveToggle üzerinden yapılır, bu buton bir daha "geri al" işlevi
 * görmez.
 */
export default function MarkNegativeButton({ customerId }: { customerId: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Bu müşteri \"Olumsuz\" statüsüne çekilip pasif yapılsın mı?")) return;
    startTransition(() => {
      markPortfolioCustomerNegative(customerId);
    });
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleClick}
      className="flex items-center gap-1.5 rounded-lg border border-red-200 dark:border-red-900 px-3.5 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-60"
    >
      <ThumbsDown className="h-4 w-4" /> {pending ? "İşleniyor…" : "Olumsuz Statüsüne Çek"}
    </button>
  );
}
