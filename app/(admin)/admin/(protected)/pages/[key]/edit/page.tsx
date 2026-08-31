import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PageSeoForm from "@/components/admin/PageSeoForm";
import { getSitePage, updatePageSeo } from "@/modules/pages/actions";
import { PAGE_ROUTE } from "@/modules/pages/schema";

export const metadata: Metadata = {
  title: "Sayfa SEO Ayarları | Ortisoft Admin",
  robots: { index: false, follow: false },
};

export default async function EditPageSeoPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const page = await getSitePage(key);
  if (!page) notFound();

  const route = PAGE_ROUTE[key] ?? "/";
  const boundAction = updatePageSeo.bind(null, key);

  return (
    <div>
      <h1 className="mb-1 text-xl font-extrabold text-slate-900 dark:text-white">
        {page.label} — SEO Ayarları
      </h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        Bu alanlar public <code>{route}</code> sayfasının <code>&lt;title&gt;</code>/meta etiketlerine yansır.
      </p>
      <PageSeoForm action={boundAction} label={page.label} route={route} page={page} />
    </div>
  );
}
