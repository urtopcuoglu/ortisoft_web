import type { Metadata } from "next";
import { isPageComingSoon, getPageSeo } from "@/modules/pages/actions";
import ComingSoonPage from "@/components/ComingSoonPage";
import HomePageContent from "@/components/home/HomePageContent";

const DEFAULT_TITLE = "Ortisoft | Dijital Dönüşüm & Yazılım Danışmanlığı";
const DEFAULT_DESCRIPTION =
  "Yazılım geliştirme, web tasarım, dijital pazarlama ve teknoloji danışmanlığında işletmenizin dijital dönüşüm ortağı.";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("home");
  return {
    title: seo?.seoTitle || DEFAULT_TITLE,
    description: seo?.seoDescription || DEFAULT_DESCRIPTION,
    keywords: seo?.seoKeywords || undefined,
  };
}

export default async function HomePage() {
  if (await isPageComingSoon("home")) {
    return <ComingSoonPage pageName="Anasayfa" />;
  }
  return <HomePageContent />;
}
