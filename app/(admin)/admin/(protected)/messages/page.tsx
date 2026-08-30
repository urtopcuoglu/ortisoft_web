import Link from "next/link";
import type { Metadata } from "next";
import { listMessages } from "@/modules/messages/actions";
import { MESSAGE_PURPOSE_LABEL } from "@/modules/messages/schema";
import type { MessagePurposeValue } from "@/modules/messages/schema";

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
  NEW: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  REPLIED: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-slate-100 text-slate-500",
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

export default async function AdminMessagesPage() {
  const messages = await listMessages();
  const newCount = messages.filter((m) => m.status === "NEW").length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-slate-900">Mesajlar</h1>
        <p className="text-sm text-slate-500">
          İletişim formundan gelen mesajlar. {newCount > 0 && (
            <span className="font-semibold text-blue-600">{newCount} yeni mesaj</span>
          )}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-500">
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
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Henüz mesaj yok.
                </td>
              </tr>
            )}
            {messages.map((msg) => (
              <tr key={msg.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-800">{msg.name}</div>
                  <div className="text-xs text-slate-500">{msg.email}</div>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {MESSAGE_PURPOSE_LABEL[msg.purpose as MessagePurposeValue]}
                </td>
                <td className="px-4 py-3 text-slate-500">{msg.service ?? "—"}</td>
                <td className="px-4 py-3 text-slate-500">{formatDate(msg.createdAt)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_CLASS[msg.status]}`}>
                    {STATUS_LABEL[msg.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/messages/${msg.id}`}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
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
