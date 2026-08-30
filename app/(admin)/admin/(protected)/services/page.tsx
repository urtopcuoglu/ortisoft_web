import Link from "next/link";
import type { Metadata } from "next";
import { listServices, deleteService } from "@/modules/services/actions";
import type { SubService } from "@/modules/services/schema";
import DeleteForm from "@/components/admin/DeleteForm";

function summarizeSubServices(subServices: unknown, currency: string) {
  const items = Array.isArray(subServices) ? (subServices as unknown as SubService[]) : [];
  const prices = items.map((i) => i.price).filter((p): p is number => typeof p === "number");
  if (items.length === 0) return "—";
  if (prices.length === 0) return `${items.length} alt hizmet`;
  const fmt = (n: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency }).format(n);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return `${items.length} alt hizmet · ${min === max ? fmt(min) : `${fmt(min)}–${fmt(max)}`}`;
}

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
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Hizmetlerimiz Sayfası</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Bu kartlar public sitedeki /services sayfasına yansır.</p>
        </div>
        <Link
          href="/admin/services/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
        >
          + Yeni Hizmet
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Başlık</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Etiket</th>
              <th className="px-4 py-3" title="Fiyat sadece admin panelinde görünür">
                Alt Hizmetler 🔒
              </th>
              <th className="px-4 py-3">Sıra</th>
              <th className="px-4 py-3 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {services.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                  Henüz hizmet eklenmedi.
                </td>
              </tr>
            )}
            {services.map((service) => (
              <tr key={service.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">{service.title}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{service.slug}</td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{service.tag}</td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                  {summarizeSubServices(service.subServices, service.pricingCurrency)}
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{service.sortOrder}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/services/${service.id}/edit`}
                      className="rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
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
