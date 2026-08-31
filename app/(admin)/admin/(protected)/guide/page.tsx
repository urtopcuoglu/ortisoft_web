import type { Metadata } from "next";
import { listGuideContacts, listGuideCategories, listGuideUsers } from "@/modules/guide/actions";
import GuideTable from "@/components/admin/GuideTable";

export const metadata: Metadata = {
  title: "Rehber | Ortisoft Admin",
  robots: { index: false, follow: false },
};

export default async function AdminGuidePage() {
  const [contacts, categories, users] = await Promise.all([
    listGuideContacts(),
    listGuideCategories(),
    listGuideUsers(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Rehber</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Firma/kişi kartvizit defteri — çözüm ortağı, tedarikçi, müşteri ve destek ilişkilerinin tek listesi.
        </p>
      </div>

      <GuideTable contacts={contacts} categories={categories} users={users} />
    </div>
  );
}
