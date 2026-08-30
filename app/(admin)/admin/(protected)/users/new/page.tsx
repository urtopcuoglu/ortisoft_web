import type { Metadata } from "next";
import UserForm from "@/components/admin/UserForm";
import { createUser } from "@/modules/users/actions";
import { verifyAdminSession } from "@/modules/shared/dal";

export const metadata: Metadata = {
  title: "Yeni Kullanıcı | Ortisoft Admin",
  robots: { index: false, follow: false },
};

export default async function NewUserPage() {
  await verifyAdminSession();

  return (
    <div>
      <h1 className="mb-6 text-xl font-extrabold text-slate-900 dark:text-white">Yeni Kullanıcı</h1>
      <UserForm mode="create" action={createUser} />
    </div>
  );
}
