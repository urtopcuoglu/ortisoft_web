import { notFound } from "next/navigation";
import type { Metadata } from "next";
import UserForm from "@/components/admin/UserForm";
import { getUser, updateUser, addUserToTeam, removeUserFromTeam } from "@/modules/users/actions";

export const metadata: Metadata = {
  title: "Kullanıcı Düzenle | Ortisoft Admin",
  robots: { index: false, follow: false },
};

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser(id);
  if (!user) notFound();

  const boundUpdate = updateUser.bind(null, id);

  return (
    <div>
      <h1 className="mb-6 text-xl font-extrabold text-slate-900 dark:text-white">Kullanıcı Düzenle</h1>
      <UserForm mode="edit" action={boundUpdate} user={user} />

      <div className="mt-8 max-w-xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <h2 className="mb-1 text-sm font-bold text-slate-800 dark:text-slate-200">Ekip Görünürlüğü</h2>
        {user.teamMember ? (
          <>
            <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
              Bu kullanıcı Hakkımızda sayfasındaki ekip listesinde yayında. Biyografi, fotoğraf ve uzmanlık
              etiketlerini{" "}
              <a href="/admin/about" className="font-semibold text-blue-600 dark:text-blue-400 underline">
                Hakkımızda &gt; Ekip Üyeleri
              </a>{" "}
              üzerinden düzenleyebilirsiniz.
            </p>
            <form action={removeUserFromTeam.bind(null, user.id)}>
              <button
                type="submit"
                className="rounded-lg border border-red-200 dark:border-red-900 px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                Ekipten Çıkar
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
              Bu kullanıcı henüz ekip listesinde yayında değil.
            </p>
            <form action={addUserToTeam.bind(null, user.id)}>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
              >
                Ekibe Ekle
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
