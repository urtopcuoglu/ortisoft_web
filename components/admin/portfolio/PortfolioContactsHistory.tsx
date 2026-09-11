"use client";

import DeleteForm from "@/components/admin/DeleteForm";
import { deletePortfolioContact } from "@/modules/portfolio/actions";
import { PORTFOLIO_CHANNEL_LABEL, PORTFOLIO_CHANNELS } from "@/modules/portfolio/schema";
import type { getPortfolioCustomer } from "@/modules/portfolio/actions";

type Contact = NonNullable<Awaited<ReturnType<typeof getPortfolioCustomer>>>["contacts"][number];

/**
 * Tüm kanallardaki temas geçmişi, kronolojik — ekleme burada DEĞİL, tablodaki
 * "+" hücrelerinden yapılır (bkz. PortfolioTable.tsx). Sadece silme var
 * (MeetingsPanel'deki delete-with-confirm deseni) — hatalı girilen bir kaydı
 * düzeltme kapısı.
 */
export default function PortfolioContactsHistory({ contacts }: { contacts: Contact[] }) {
  const counts = PORTFOLIO_CHANNELS.map((ch) => ({
    channel: ch,
    label: PORTFOLIO_CHANNEL_LABEL[ch],
    count: contacts.filter((c) => c.channel === ch).length,
  }));

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {counts.map((c) => (
          <span
            key={c.channel}
            className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300"
          >
            {c.label}: {c.count}
          </span>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Tarih</th>
              <th className="px-4 py-3">Kanal</th>
              <th className="px-4 py-3">Notlar</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">Ekleyen</th>
              <th className="px-4 py-3 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                  Henüz temas kaydı yok — tablodaki kanal hücrelerinden &quot;+&quot; ile ekleyebilirsiniz.
                </td>
              </tr>
            )}
            {contacts.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 align-top">
                <td className="whitespace-nowrap px-4 py-3 text-slate-500 dark:text-slate-400">
                  {new Date(c.contactedAt).toLocaleDateString("tr-TR")}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {PORTFOLIO_CHANNEL_LABEL[c.channel]}
                  </span>
                </td>
                <td className="max-w-md px-4 py-3 text-slate-700 dark:text-slate-300">
                  <p className="whitespace-pre-wrap">{c.notes}</p>
                  {c.remarks && <p className="mt-1 whitespace-pre-wrap text-xs text-slate-400 dark:text-slate-500">{c.remarks}</p>}
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{c.status?.name ?? "—"}</td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{c.createdBy?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <DeleteForm action={deletePortfolioContact.bind(null, c.id)} confirmMessage="Bu temas kaydı silinsin mi?" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
