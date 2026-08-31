import type { Metadata } from "next";
import SiteSettingsForm from "@/components/admin/SiteSettingsForm";
import { getSiteSettings, updateSiteSettings } from "@/modules/settings/actions";

export const metadata: Metadata = {
  title: "Header/Footer Ayarları | Ortisoft Admin",
  robots: { index: false, follow: false },
};

export default async function SiteSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="mb-1 text-xl font-extrabold text-slate-900 dark:text-white">Header/Footer Ayarları</h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        Bu alanlar public sitenin footer&apos;ındaki iletişim bilgilerine ve sosyal medya linklerine yansır.
      </p>
      <SiteSettingsForm action={updateSiteSettings} settings={settings} />
    </div>
  );
}
