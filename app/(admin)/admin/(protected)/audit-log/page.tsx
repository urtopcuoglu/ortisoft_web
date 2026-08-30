import Link from "next/link";
import type { Metadata } from "next";
import { listAuditLogs } from "@/modules/shared/audit";

export const metadata: Metadata = {
  title: "Denetim Kaydı | Ortisoft Admin",
  robots: { index: false, follow: false },
};

const ACTION_LABEL: Record<string, string> = {
  CREATE: "Oluşturdu",
  UPDATE: "Güncelledi",
  DELETE: "Sildi",
};

const ACTION_CLASS: Record<string, string> = {
  CREATE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  UPDATE: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  DELETE: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).format(date);
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { logs, totalPages } = await listAuditLogs({ page });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Denetim Kaydı</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
          Admin panelinde yapılan tüm ekleme/güncelleme/silme işlemlerinin salt-okunur geçmişi.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 dark:text-slate-500">
            <tr>
              <th className="px-4 py-3">Kim</th>
              <th className="px-4 py-3">İşlem</th>
              <th className="px-4 py-3">Varlık</th>
              <th className="px-4 py-3">Tarih</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                  Henüz kayıt yok.
                </td>
              </tr>
            )}
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                  {log.actor?.name ?? <span className="text-slate-400 dark:text-slate-500">Silinmiş kullanıcı</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${ACTION_CLASS[log.action]}`}>
                    {ACTION_LABEL[log.action] ?? log.action}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
                  {log.entityType} <span className="text-slate-300 dark:text-slate-600">#{log.entityId.slice(0, 8)}</span>
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 dark:text-slate-500">{formatDate(log.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/audit-log?page=${p}`}
              className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-semibold ${
                p === page
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
