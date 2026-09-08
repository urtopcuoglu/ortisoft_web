import type { Metadata } from "next";
import { listGuideContacts, listGuideCategories, listGuideUsers } from "@/modules/guide/actions";
import { listInfluencers, listInfluencerPlatforms } from "@/modules/influencer/actions";
import GuideTable from "@/components/admin/GuideTable";
import InfluencerTable from "@/components/admin/influencer/InfluencerTable";
import CrmSectionTabs from "@/components/admin/crm/CrmSectionTabs";

export const metadata: Metadata = {
  title: "CRM | Ortisoft Admin",
  robots: { index: false, follow: false },
};

export default async function AdminCrmPage() {
  const [contacts, categories, users, influencers, influencerPlatforms] = await Promise.all([
    listGuideContacts(),
    listGuideCategories(),
    listGuideUsers(),
    listInfluencers(),
    listInfluencerPlatforms(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">CRM</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Mevcut/potansiyel/eski müşteriler, çözüm ortakları, tedarikçiler ve influencer&apos;lar — firma adına
          tıklayıp görüşme notu, teklif, sözleşme ve ödeme geçmişini görebilirsiniz.
        </p>
      </div>

      <CrmSectionTabs
        companiesCount={contacts.length}
        influencerCount={influencers.length}
        companies={<GuideTable contacts={contacts} categories={categories} users={users} />}
        influencer={<InfluencerTable influencers={influencers} platforms={influencerPlatforms} />}
      />
    </div>
  );
}
