import Link from "next/link";
import type { Metadata } from "next";
import { listContracts, deleteContract } from "@/modules/contracts/actions";
import DeleteForm from "@/components/admin/DeleteForm";

export const metadata: Metadata = {
  title: "Sözleşmeler | Ortisoft Admin",
  robots: { index: false, follow: false },
};

export default async function AdminContractsPage() {
  const contracts = await listContracts();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Sözleşmeler</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Bu liste sitenin footer&apos;ında görünür, her biri kendi /contracts/[slug] sayfasına sahiptir.
          </p>
        </div>
        <Link
          href="/admin/contracts/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
        >
          + Yeni Sözleşme
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Başlık</th>
              <th className="px-4 py-3">URL</th>
              <th className="px-4 py-3">Sıra</th>
              <th className="px-4 py-3 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {contracts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                  Henüz sözleşme eklenmedi.
                </td>
              </tr>
            )}
            {contracts.map((contract) => (
              <tr key={contract.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">{contract.title}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">/contracts/{contract.slug}</td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{contract.sortOrder}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/contracts/${contract.slug}`}
                      target="_blank"
                      className="rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                      Görüntüle
                    </Link>
                    <Link
                      href={`/admin/contracts/${contract.id}/edit`}
                      className="rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                      Düzenle
                    </Link>
                    <DeleteForm
                      action={deleteContract.bind(null, contract.id)}
                      confirmMessage={`"${contract.title}" sözleşmesi silinsin mi?`}
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
