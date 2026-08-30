import type { Metadata } from "next";
import { getCurrentUser } from "@/modules/shared/dal";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";

export const metadata: Metadata = {
  title: "Ayarlar | Ortisoft Admin",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Ayarlar</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {user?.name} · {user?.email}
        </p>
      </div>

      <section>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Şifre Değiştir
        </h2>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
