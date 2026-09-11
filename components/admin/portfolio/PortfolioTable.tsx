"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import PortfolioCustomerModal from "./PortfolioCustomerModal";
import PortfolioContactModal from "./PortfolioContactModal";
import { PORTFOLIO_CHANNEL_LABEL, PORTFOLIO_CHANNELS } from "@/modules/portfolio/schema";
import type { listPortfolioCustomers, listPortfolioContactStatuses } from "@/modules/portfolio/actions";
import type { PortfolioChannel } from "@/lib/generated/prisma/client";

export type PortfolioCustomerRow = Awaited<ReturnType<typeof listPortfolioCustomers>>[number];
type StatusOption = Awaited<ReturnType<typeof listPortfolioContactStatuses>>[number];

const thClass = "px-4 py-3";

/** Kanban DEĞİL — her satırda 4 sabit kanal hücresi, her hücrede sayaç + "+". */
export default function PortfolioTable({
  customers,
  services,
  statuses,
}: {
  customers: PortfolioCustomerRow[];
  services: { id: string; title: string }[];
  statuses: StatusOption[];
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [contactTarget, setContactTarget] = useState<{ customerId: string; customerName: string; channel: PortfolioChannel } | null>(
    null
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) => c.companyName.toLowerCase().includes(q) || c.authorizedPerson.toLowerCase().includes(q)
    );
  }, [customers, search]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Firma veya yetkili ara…"
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-9 pr-3 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500"
          />
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Müşteri Ekle
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
            <tr>
              <th className={thClass}>Firma Adı</th>
              <th className={thClass}>Yetkili</th>
              <th className={thClass}>Hizmet</th>
              {PORTFOLIO_CHANNELS.map((ch) => (
                <th key={ch} className={`${thClass} text-center`}>
                  {PORTFOLIO_CHANNEL_LABEL[ch]}
                </th>
              ))}
              <th className={thClass}>Durum</th>
              <th className={`${thClass} text-right`}>&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4 + PORTFOLIO_CHANNELS.length} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500">
                  Henüz müşteri kaydı yok.
                </td>
              </tr>
            )}
            {filtered.map((c) => (
              <tr
                key={c.id}
                className={`border-b border-slate-100 dark:border-slate-800 last:border-0 align-top ${
                  !c.isActive ? "opacity-50" : ""
                }`}
              >
                <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">{c.companyName}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{c.authorizedPerson}</td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{c.service?.title ?? "—"}</td>
                {PORTFOLIO_CHANNELS.map((ch) => (
                  <td key={ch} className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => setContactTarget({ customerId: c.id, customerName: c.companyName, channel: ch })}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <Plus className="h-3 w-3" /> {c.channelCounts[ch]}
                    </button>
                  </td>
                ))}
                <td className="px-4 py-3">
                  {c.currentStatus ? (
                    <span className="rounded-full bg-red-100 dark:bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-700 dark:text-red-400">
                      {c.currentStatus.name}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">{c.isActive ? "Aktif" : "Pasif"}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/crm/portfolio/${c.id}`}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    Detayları Gör
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PortfolioCustomerModal open={addOpen} onOpenChange={setAddOpen} services={services} />

      {contactTarget && (
        <PortfolioContactModal
          open={!!contactTarget}
          onOpenChange={(o) => !o && setContactTarget(null)}
          customerId={contactTarget.customerId}
          customerName={contactTarget.customerName}
          channel={contactTarget.channel}
          statuses={statuses}
        />
      )}
    </div>
  );
}
