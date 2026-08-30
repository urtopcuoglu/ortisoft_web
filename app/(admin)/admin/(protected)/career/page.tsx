import Link from "next/link";
import type { Metadata } from "next";
import { listAllCareerPostings, deleteCareerPosting } from "@/modules/career/actions";
import DeleteForm from "@/components/admin/DeleteForm";

export const metadata: Metadata = {
  title: "Kariyer | Ortisoft Admin",
  robots: { index: false, follow: false },
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Taslak",
  PUBLISHED: "Yayında",
  CLOSED: "Kapalı",
};

const STATUS_CLASS: Record<string, string> = {
  DRAFT: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
  PUBLISHED: "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  CLOSED: "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400",
};

export default async function AdminCareerPage() {
  const postings = await listAllCareerPostings();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Kariyer İlanları</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            &quot;Yayında&quot; durumundaki ilanlar public sitedeki /career sayfasında görünür.
          </p>
        </div>
        <Link
          href="/admin/career/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
        >
          + Yeni İlan
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Başlık</th>
              <th className="px-4 py-3">Konum</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {postings.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                  Henüz ilan eklenmedi.
                </td>
              </tr>
            )}
            {postings.map((posting) => (
              <tr key={posting.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">{posting.title}</td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{posting.location}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_CLASS[posting.status]}`}>
                    {STATUS_LABEL[posting.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/career/${posting.id}/edit`}
                      className="rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                      Düzenle
                    </Link>
                    <DeleteForm
                      action={deleteCareerPosting.bind(null, posting.id)}
                      confirmMessage={`"${posting.title}" ilanı silinsin mi?`}
                    />
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
