import Link from "next/link";
import type { Metadata } from "next";
import { listReferences, deleteReference } from "@/modules/references/actions";
import DeleteForm from "@/components/admin/DeleteForm";

export const metadata: Metadata = {
  title: "Referanslar | Ortisoft Admin",
  robots: { index: false, follow: false },
};

export default async function AdminReferencesPage() {
  const references = await listReferences();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Referanslarımız</h1>
          <p className="text-sm text-slate-500">
            Bu liste hem /references hem de /about sayfasındaki referans bölümüne yansır.
          </p>
        </div>
        <Link
          href="/admin/references/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
        >
          + Yeni Referans
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Marka</th>
              <th className="px-4 py-3">Açıklama</th>
              <th className="px-4 py-3">Sıra</th>
              <th className="px-4 py-3 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {references.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  Henüz referans eklenmedi.
                </td>
              </tr>
            )}
            {references.map((reference) => (
              <tr key={reference.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-semibold text-slate-800">{reference.clientName}</td>
                <td className="max-w-xs truncate px-4 py-3 text-slate-500">{reference.description}</td>
                <td className="px-4 py-3 text-slate-500">{reference.sortOrder}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/references/${reference.id}/edit`}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Düzenle
                    </Link>
                    <DeleteForm
                      action={deleteReference.bind(null, reference.id)}
                      confirmMessage={`"${reference.clientName}" silinsin mi?`}
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
