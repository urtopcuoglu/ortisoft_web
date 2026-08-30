import Link from "next/link";
import type { Metadata } from "next";
import { Download } from "lucide-react";
import { listCvSubmissions } from "@/modules/messages/actions";

export const metadata: Metadata = {
  title: "Aday CV'leri | Ortisoft Admin",
  robots: { index: false, follow: false },
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

export default async function AdminCvsPage() {
  const submissions = await listCvSubmissions();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-slate-900">Aday CV&apos;leri</h1>
        <p className="text-sm text-slate-500">
          İletişim formundan &quot;CV Göndermek İstiyorum&quot; ile gelen başvurular. Detaylı görüşme
          geçmişi ve durum yönetimi için{" "}
          <Link href="/admin/messages" className="text-blue-600 underline">Mesajlar</Link> sayfasını kullanabilirsin.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Aday</th>
              <th className="px-4 py-3">Ön Yazı</th>
              <th className="px-4 py-3">Tarih</th>
              <th className="px-4 py-3 text-right">CV</th>
            </tr>
          </thead>
          <tbody>
            {submissions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  Henüz CV başvurusu yok.
                </td>
              </tr>
            )}
            {submissions.map((sub) => (
              <tr key={sub.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-800">{sub.name}</div>
                  <div className="text-xs text-slate-500">{sub.email}</div>
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-slate-500">
                  {sub.message || <span className="text-slate-300">—</span>}
                </td>
                <td className="px-4 py-3 text-slate-500">{formatDate(sub.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  {sub.cvFilePath ? (
                    <a
                      href={`/admin/career/cvs/${sub.id}/download`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      <Download className="w-3.5 h-3.5" /> İndir
                    </a>
                  ) : (
                    <span className="text-xs text-slate-300">Dosya yok</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
