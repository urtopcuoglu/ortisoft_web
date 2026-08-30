import type { Metadata } from "next";
import ServiceForm from "@/components/admin/ServiceForm";
import { createService } from "@/modules/services/actions";

export const metadata: Metadata = {
  title: "Yeni Hizmet | Ortisoft Admin",
  robots: { index: false, follow: false },
};

export default function NewServicePage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-extrabold text-slate-900 dark:text-white">Yeni Hizmet</h1>
      <ServiceForm action={createService} submitLabel="Oluştur" />
    </div>
  );
}
