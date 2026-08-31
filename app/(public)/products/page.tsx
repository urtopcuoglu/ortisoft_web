import Link from "next/link";
import type { Metadata } from "next";
import {
  Sparkles, ArrowRight, Mail, Rocket, Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { isPageComingSoon, getPageSeo } from "@/modules/pages/actions";
import ComingSoonPage from "@/components/ComingSoonPage";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("products");
  return {
    title: seo?.seoTitle || "Ürünlerimiz | Ortisoft",
    description: seo?.seoDescription || "Ortisoft'un geliştirdiği kendi SaaS ürünleri ve yakında gelecek çözümler.",
    keywords: seo?.seoKeywords || undefined,
  };
}

const highlights = [
  {
    icon: Rocket,
    title: "Kendi SaaS Ürünlerimiz",
    desc: "Sektöre özel geliştirdiğimiz yazılım çözümleri.",
  },
  {
    icon: Bell,
    title: "Erken Erişim",
    desc: "Yayına alındığında ilk haber alanlardan olun.",
  },
  {
    icon: Sparkles,
    title: "Sürekli Gelişim",
    desc: "Ürün portföyümüz her ay yeni eklemelerle büyüyor.",
  },
];

export default async function ProductsPage() {
  if (await isPageComingSoon("products")) {
    return <ComingSoonPage pageName="Ürünlerimiz" />;
  }

  return (
    <div className="flex flex-col">

      {/* ── Coming Soon ── */}
      <section className="relative min-h-[calc(100vh-var(--header-height))] flex items-center justify-center overflow-hidden animated-gradient">
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute top-1/4 left-12 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl float" />
        <div className="absolute bottom-1/4 right-12 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />

        <div className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold mb-8 backdrop-blur-sm">
            <Sparkles size={14} className="text-blue-300" />
            SaaS &amp; Açık Kaynak
          </div>

          <h1 className="heading-xl text-white mb-7">
            <span className="gradient-text">Çok Yakında</span>
            <br />
            Burada Olacak
          </h1>

          <p className="body-lg text-slate-300 mb-12 max-w-xl mx-auto">
            Kendi bünyemizde geliştirdiğimiz ürünlerin sayfası şu anda hazırlanıyor.
            Demo ve detaylar için bizimle iletişime geçebilirsiniz.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button variant="gradient" size="xl" asChild>
              <Link href="/contact">
                <Mail className="w-5 h-5" />
                Bilgi Almak İçin Ulaşın
              </Link>
            </Button>
            <Button
              size="xl"
              className="border-2 border-white/25 text-white bg-white/8 hover:bg-white/15 hover:-translate-y-0.5 transition-all backdrop-blur-sm"
              asChild
            >
              <Link href="/">
                Ana Sayfaya Dön
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl p-6 bg-white/8 border border-white/12 backdrop-blur-sm text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-blue-300" />
                </div>
                <h3 className="text-white font-bold text-sm mb-1.5">{item.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
