import Link from "next/link";
import type { Metadata } from "next";
import { listMessages } from "@/modules/messages/actions";
import {
  MESSAGE_PURPOSE_LABEL,
  MESSAGE_PURPOSES,
  MESSAGE_STATUSES,
  type MessagePurposeValue,
  type MessageStatusValue,
} from "@/modules/messages/schema";

export const metadata: Metadata = {
  title: "Mesajlar | Ortisoft Admin",
  robots: { index: false, follow: false },
};

const STATUS_LABEL: Record<string, string> = {
  NEW: "Yeni",
  IN_PROGRESS: "İşlemde",
  REPLIED: "Yanıtlandı",
  CLOSED: "Kapalı",
};

const STATUS_CLASS: Record<string, string> = {
  NEW: "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400",
  IN_PROGRESS: "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400",
  REPLIED: "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  CLOSED: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; purpose?: string }>;
}) {
  const { status: statusParam, purpose: purposeParam } = await searchParams;
  const status = MESSAGE_STATUSES.includes(statusParam as MessageStatusValue)
    ? (statusParam as MessageStatusValue)
    : undefined;
  const purpose = MESSAGE_PURPOSES.includes(purposeParam as MessagePurposeValue)
    ? (purposeParam as MessagePurposeValue)
    : undefined;

  const messages = await listMessages({ status, purpose });
  const newCount = messages.filter((m) => m.status === "NEW").length;
  const hasFilters = Boolean(status || purpose);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Mesajlar</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          İletişim formundan gelen mesajlar. {newCount > 0 && (
            <span className="font-semibold text-blue-600 dark:text-blue-400">{newCount} yeni mesaj</span>
          )}
        </p>
      </div>

      <form method="get" className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Durum</label>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
          >
            <option value="">Tümü</option>
            {MESSAGE_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Talep Türü</label>
          <select
            name="purpose"
            defaultValue={purpose ?? ""}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
          >
            <option value="">Tümü</option>
            {MESSAGE_PURPOSES.map((p) => (
              <option key={p} value={p}>{MESSAGE_PURPOSE_LABEL[p]}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-bold text-white hover:bg-blue-700"
        >
          Filtrele
        </button>
        {hasFilters && (
          <Link href="/admin/messages" className="text-xs font-semibold text-slate-500 dark:text-slate-400 underline">
            Filtreleri temizle
          </Link>
        )}
        <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">{messages.length} mesaj</span>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Gönderen</th>
              <th className="px-4 py-3">Talep</th>
              <th className="px-4 py-3">Konu / Hizmet</th>
              <th className="px-4 py-3">Tarih</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {messages.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                  {hasFilters ? "Bu kriterlere uygun mesaj yok." : "Henüz mesaj yok."}
                </td>
              </tr>
            )}
            {messages.map((msg) => (
              <tr key={msg.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-800 dark:text-slate-100">{msg.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{msg.email}</div>
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                  {MESSAGE_PURPOSE_LABEL[msg.purpose as MessagePurposeValue]}
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{msg.service ?? "—"}</td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{formatDate(msg.createdAt)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_CLASS[msg.status]}`}>
                    {STATUS_LABEL[msg.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/messages/${msg.id}`}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    Görüntüle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
