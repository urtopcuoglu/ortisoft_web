import Link from "next/link";
import type { Metadata } from "next";
import { getAboutContent, listTeamMembers, deleteTeamMember } from "@/modules/about/actions";
import AboutContentForm from "@/components/admin/AboutContentForm";
import DeleteForm from "@/components/admin/DeleteForm";

export const metadata: Metadata = {
  title: "Hakkımızda | Ortisoft Admin",
  robots: { index: false, follow: false },
};

export default async function AdminAboutPage() {
  const [content, team] = await Promise.all([getAboutContent(), listTeamMembers()]);

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="mb-1 text-xl font-extrabold text-slate-900">Hakkımızda Sayfası</h1>
        <p className="mb-6 text-sm text-slate-500">
          Bu alanlar public sitedeki /about sayfasına yansır.
        </p>
        <AboutContentForm content={content} />
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Ekip Üyeleri</h2>
          <Link
            href="/admin/about/team/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
          >
            + Yeni Üye
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">İsim</th>
                <th className="px-4 py-3">Unvan</th>
                <th className="px-4 py-3">Sıra</th>
                <th className="px-4 py-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {team.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    Henüz ekip üyesi eklenmedi.
                  </td>
                </tr>
              )}
              {team.map((member) => (
                <tr key={member.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-semibold text-slate-800">{member.name}</td>
                  <td className="px-4 py-3 text-slate-500">{member.role}</td>
                  <td className="px-4 py-3 text-slate-500">{member.sortOrder}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/about/team/${member.id}/edit`}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Düzenle
                      </Link>
                      <DeleteForm
                        action={deleteTeamMember.bind(null, member.id)}
                        confirmMessage={`"${member.name}" silinsin mi?`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
