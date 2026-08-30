import Link from "next/link";
import type { Metadata } from "next";
import { listProjects, deleteProject } from "@/modules/projects/actions";
import DeleteForm from "@/components/admin/DeleteForm";

export const metadata: Metadata = {
  title: "Projeler | Ortisoft Admin",
  robots: { index: false, follow: false },
};

const STATUS_LABEL: Record<string, string> = {
  COMING_SOON: "Çok Yakında",
  IN_DEVELOPMENT: "Geliştiriliyor",
  ACTIVE: "Aktif",
};

const STATUS_CLASS: Record<string, string> = {
  COMING_SOON: "bg-amber-100 text-amber-700",
  IN_DEVELOPMENT: "bg-blue-100 text-blue-700",
  ACTIVE: "bg-emerald-100 text-emerald-700",
};

export default async function AdminProjectsPage() {
  const projects = await listProjects();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Projelerimiz</h1>
          <p className="text-sm text-slate-500">
            Bu kartlar public sitedeki /projects sayfasına yansır.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
        >
          + Yeni Proje
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Başlık</th>
              <th className="px-4 py-3">Fon/Kaynak</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">Sıra</th>
              <th className="px-4 py-3 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Henüz proje eklenmedi.
                </td>
              </tr>
            )}
            {projects.map((project) => (
              <tr key={project.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-semibold text-slate-800">{project.title}</td>
                <td className="px-4 py-3 text-slate-500">{project.fundingLabel}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_CLASS[project.status]}`}>
                    {STATUS_LABEL[project.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{project.sortOrder}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/projects/${project.id}/edit`}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Düzenle
                    </Link>
                    <DeleteForm
                      action={deleteProject.bind(null, project.id)}
                      confirmMessage={`"${project.title}" silinsin mi?`}
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
