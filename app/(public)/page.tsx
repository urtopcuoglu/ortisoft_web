import { isPageComingSoon } from "@/modules/pages/actions";
import ComingSoonPage from "@/components/ComingSoonPage";
import HomePageContent from "@/components/home/HomePageContent";

export default async function HomePage() {
  if (await isPageComingSoon("home")) {
    return <ComingSoonPage pageName="Anasayfa" />;
  }
  return <HomePageContent />;
}
