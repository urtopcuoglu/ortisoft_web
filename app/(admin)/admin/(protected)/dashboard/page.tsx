import type { Metadata } from "next";
import { getCurrentUser } from "@/modules/shared/dal";

export const metadata: Metadata = {
  title: "Panel | Ortisoft Admin",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  return (
    <div>
      <h1 className="mb-2 text-2xl font-extrabold text-slate-900">
        Hoş geldin{user?.name ? `, ${user.name}` : ""} 👋
      </h1>
      <p className="text-sm text-slate-500">
        Faz 1 tamamlandı — kimlik doğrulama çalışıyor. İçerik yönetim modülleri
        (Hakkımızda, Kariyer, Referanslar, Projeler, Mesajlar, Blog) Faz 2 ve
        sonrasında bu panele eklenecek.
      </p>
    </div>
  );
}
