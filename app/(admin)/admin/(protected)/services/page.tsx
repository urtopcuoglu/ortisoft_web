import Link from "next/link";
import type { Metadata } from "next";
import { listServices, deleteService } from "@/modules/services/actions";
import DeleteForm from "@/components/admin/DeleteForm";

export const metadata: Metadata = {
  title: "Hizmetler | Ortisoft Admin",
  robots: { index: false, follow: false },
};

export default async function AdminServicesPage() {
  const services = await listServices();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Hizmetlerimiz Sayfası</h1>
          <p className="text-sm text-slate-500">Bu kartlar public sitedeki /services sayfasına yansır.</p>
        </div>
        <Link
          href="/admin/services/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
        >
          + Yeni Hizmet
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Başlık</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Etiket</th>
              <th className="px-4 py-3">Sıra</th>
              <th className="px-4 py-3 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {services.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Henüz hizmet eklenmedi.
                </td>
              </tr>
            )}
            {services.map((service) => (
              <tr key={service.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-semibold text-slate-800">{service.title}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{service.slug}</td>
                <td className="px-4 py-3 text-slate-500">{service.tag}</td>
                <td className="px-4 py-3 text-slate-500">{service.sortOrder}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/services/${service.id}/edit`}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Düzenle
                    </Link>
                    <DeleteForm
                      action={deleteService.bind(null, service.id)}
                      confirmMessage={`"${service.title}" silinsin mi?`}
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
