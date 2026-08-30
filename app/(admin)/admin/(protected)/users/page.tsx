import Link from "next/link";
import type { Metadata } from "next";
import { listUsers, deleteUser, addUserToTeam, removeUserFromTeam } from "@/modules/users/actions";
import { USER_ROLE_LABEL } from "@/modules/users/schema";
import { getCurrentUser } from "@/modules/shared/dal";
import DeleteForm from "@/components/admin/DeleteForm";

export const metadata: Metadata = {
  title: "Kullanıcılar | Ortisoft Admin",
  robots: { index: false, follow: false },
};

export default async function AdminUsersPage() {
  const [users, currentUser] = await Promise.all([listUsers(), getCurrentUser()]);

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Kullanıcılar</h1>
        <Link
          href="/admin/users/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
        >
          + Yeni Kullanıcı
        </Link>
      </div>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        Admin paneline giriş yapabilen personel hesapları. &quot;Ekibe ekle&quot; ile bağlanan kullanıcılar
        Hakkımızda sayfasındaki ekip listesinde ad soyad ve görev bilgisiyle yayınlanır.
      </p>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Ad Soyad</th>
              <th className="px-4 py-3">Görev / Departman</th>
              <th className="px-4 py-3">Telefon</th>
              <th className="px-4 py-3">E-posta</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Ekip</th>
              <th className="px-4 py-3 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                  Henüz kullanıcı yok.
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">
                  {u.name}
                  {u.id === currentUser?.id && (
                    <span className="ml-1.5 text-xs font-normal text-slate-400">(sen)</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                  {u.title || "—"}
                  {u.department && <span className="text-slate-400 dark:text-slate-600"> · {u.department}</span>}
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                  {u.personalPhone && <div>Kişisel: {u.personalPhone}</div>}
                  {u.companyPhone && <div>Şirket: {u.companyPhone}</div>}
                  {!u.personalPhone && !u.companyPhone && "—"}
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{u.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${
                      u.role === "ADMIN"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {USER_ROLE_LABEL[u.role]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.teamMember ? (
                    <form action={removeUserFromTeam.bind(null, u.id)}>
                      <button
                        type="submit"
                        className="rounded-full bg-emerald-100 dark:bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-500/20"
                        title="Ekipten çıkar (public bio silinmez)"
                      >
                        Ekipte ✓
                      </button>
                    </form>
                  ) : (
                    <form action={addUserToTeam.bind(null, u.id)}>
                      <button
                        type="submit"
                        className="rounded-full border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                      >
                        Ekibe ekle
                      </button>
                    </form>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/users/${u.id}/edit`}
                      className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                      Düzenle
                    </Link>
                    {u.id !== currentUser?.id && (
                      <DeleteForm
                        action={deleteUser.bind(null, u.id)}
                        confirmMessage={`"${u.name}" kullanıcısı silinsin mi?`}
                      />
                    )}
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
