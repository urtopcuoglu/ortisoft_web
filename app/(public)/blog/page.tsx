import type { Metadata } from "next";
import ComingSoonPage from "@/components/ComingSoonPage";

export const metadata: Metadata = {
  title: "Blog | Ortisoft",
};

// Blog içerik modülü henüz geliştirilmedi (plan: Faz 5). Bu sayfa şimdilik
// admin panelindeki "Yakında" toggle'ından bağımsız olarak her zaman
// placeholder gösterir — modül gelince buraya gerçek liste eklenecek.
export default function BlogPage() {
  return <ComingSoonPage pageName="Blog" />;
}
