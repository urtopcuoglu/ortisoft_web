import type { Metadata } from "next";
import { listSitePages } from "@/modules/pages/actions";
import ComingSoonToggle from "@/components/admin/ComingSoonToggle";

export const metadata: Metadata = {
  title: "Sayfa Yönetimi | Ortisoft Admin",
  robots: { index: false, follow: false },
};

const PAGE_PATH: Record<string, string> = {
  home: "/",
  about: "/about",
  services: "/services",
  products: "/products",
  projects: "/projects",
  references: "/references",
  career: "/career",
  contact: "/contact",
  blog: "/blog",
};

export default async function AdminPagesPage() {
  const pages = await listSitePages();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Sayfa Yönetimi</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Bir sayfayı &quot;Yakında&quot; moduna alırsan, ziyaretçiler o sayfada geliştirme/güncelleme
          sırasında yaptığın değişiklikleri görmez — bunun yerine genel bir &quot;çok yakında&quot;
          ekranı gösterilir. Sözleşme sayfaları bu listede yer almaz.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Sayfa</th>
              <th className="px-4 py-3">URL</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">Yakında Modu</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.key} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">{page.label}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{PAGE_PATH[page.key] ?? "—"}</td>
                <td className="px-4 py-3">
                  {page.comingSoon ? (
                    <span className="rounded-full bg-amber-100 dark:bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                      Yakında
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      Aktif
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <ComingSoonToggle pageKey={page.key} initialValue={page.comingSoon} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
