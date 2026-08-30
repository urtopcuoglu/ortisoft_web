"use client";

import Link from "next/link";
import {
  Rocket, Code2, BarChart3, ArrowRight,
  CheckCircle2, Search, Lightbulb, Wrench, LineChart,
  Monitor, Server, Share2, ShoppingCart, Briefcase, Award, Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const services = [
  {
    id: "software",
    icon: Code2,
    tag: "Tech & Dev",
    title: "Yazılım Geliştirme",
    description:
      "Masaüstü, mobil ve web uygulamalarından kurumsal yazılım çözümlerine kadar geniş bir yelpazede özel geliştirme hizmetleri sunuyoruz.",
    features: [
      "Masaüstü Uygulamaları Geliştirme",
      "Mobil Uygulama Geliştirme",
      "Web Uygulamaları",
      "Özelleştirilmiş Finans, CRM, ERP, CMS Paket Uygulamaları",
      "Firma ve İşletmelere Özel Bulut Tabanlı Entegrasyon Çözümleri",
    ],
    colors: {
      badge:    "bg-blue-50 text-blue-700 border-blue-200",
      iconBg:   "bg-blue-100",
      iconText: "text-blue-600",
      check:    "text-blue-500",
      border:   "border-blue-100 hover:border-blue-300",
      glow:     "hover:shadow-blue-100",
    },
  },
  {
    id: "webdesign",
    icon: Monitor,
    tag: "Design & UX",
    title: "Web Tasarım",
    description:
      "Tüm cihazlarda mükemmel görünen, dönüşüm odaklı modern web siteleri tasarlıyor ve geliştiriyoruz.",
    features: [
      "Mobil Uyumlu, E-Ticaret Web Sitesi",
      "Mobil Uyumlu, Kurumsal Web Sitesi",
      "Mobil Uyumlu, Kişisel Web Sitesi",
      "Mobil Uyumlu, WordPress, OpenCart, Wix ve PrestaShop Web Siteleri",
    ],
    colors: {
      badge:    "bg-violet-50 text-violet-700 border-violet-200",
      iconBg:   "bg-violet-100",
      iconText: "text-violet-600",
      check:    "text-violet-500",
      border:   "border-violet-100 hover:border-violet-300",
      glow:     "hover:shadow-violet-100",
    },
  },
  {
    id: "techconsulting",
    icon: Server,
    tag: "IT & Infrastructure",
    title: "Teknoloji Danışmanlığı",
    description:
      "Sunucu, ağ, donanım ve güvenlik altyapınızı optimize etmek için kapsamlı teknoloji danışmanlığı hizmetleri sunuyoruz.",
    features: [
      "Sunucu, Mail, Barındırma, Domain, SSL Çözümleri",
      "Donanım, Network, Sistem Çözümleri",
      "Güvenlik Çözümleri",
    ],
    colors: {
      badge:    "bg-cyan-50 text-cyan-700 border-cyan-200",
      iconBg:   "bg-cyan-100",
      iconText: "text-cyan-600",
      check:    "text-cyan-500",
      border:   "border-cyan-100 hover:border-cyan-300",
      glow:     "hover:shadow-cyan-100",
    },
  },
  {
    id: "digitalmarketing",
    icon: BarChart3,
    tag: "Growth & SEO",
    title: "Dijital Pazarlama Danışmanlığı",
    description:
      "Arama motorlarından e-posta pazarlamasına kadar veri odaklı dijital pazarlama stratejileriyle büyümenizi hızlandırıyoruz.",
    features: [
      "Arama Motoru Reklamcılığı (Google Ads, Yandex Metrika vb.)",
      "SEO Çözümleri",
      "On Page – Off Page SEO Hizmetleri",
      "ASO (App Search Optimization) Hizmetleri",
      "GEO (Generative Engine Optimization) Hizmetleri",
      "Mail – SMS Pazarlaması Hizmetleri",
    ],
    colors: {
      badge:    "bg-emerald-50 text-emerald-700 border-emerald-200",
      iconBg:   "bg-emerald-100",
      iconText: "text-emerald-600",
      check:    "text-emerald-500",
      border:   "border-emerald-100 hover:border-emerald-300",
      glow:     "hover:shadow-emerald-100",
    },
  },
  {
    id: "socialmedia",
    icon: Share2,
    tag: "Social & Influencer",
    title: "Sosyal Medya Danışmanlığı",
    description:
      "Markanızın sosyal medyada güçlü bir varlık kurmasını sağlıyor; reklam, içerik ve influencer stratejilerini bir arada yönetiyoruz.",
    features: [
      "Sosyal Medya Reklamcılık (Meta, TikTok, Twitter) Hizmetleri",
      "Sosyal Medya Hesap Yönetimi & Hesap Analiz Hizmetleri",
      "Influencer Pazarlama, UGC, İçerik Pazarlama Hizmetleri",
    ],
    colors: {
      badge:    "bg-pink-50 text-pink-700 border-pink-200",
      iconBg:   "bg-pink-100",
      iconText: "text-pink-600",
      check:    "text-pink-500",
      border:   "border-pink-100 hover:border-pink-300",
      glow:     "hover:shadow-pink-100",
    },
  },
  {
    id: "ecommerce",
    icon: ShoppingCart,
    tag: "E-Commerce",
    title: "E-Ticaret Danışmanlığı",
    description:
      "Çoklu pazaryerlerinden özel entegrasyonlara, ürün içeriklerinden yönetim çözümlerine kadar e-ticaretinizi büyütüyoruz.",
    features: [
      "Çoklu Pazaryeri ve Platform Kurulum Çözümleri",
      "Özel Entegrasyon ve Yönetim Çözümleri",
      "Ürün – İçerik Çözümleri (Ürün Görseli ve Ürün İçerikleri Hakkında Çalışmalar)",
    ],
    colors: {
      badge:    "bg-orange-50 text-orange-700 border-orange-200",
      iconBg:   "bg-orange-100",
      iconText: "text-orange-600",
      check:    "text-orange-500",
      border:   "border-orange-100 hover:border-orange-300",
      glow:     "hover:shadow-orange-100",
    },
  },
  {
    id: "management",
    icon: Briefcase,
    tag: "Strategy & Operations",
    title: "Yönetim Danışmanlığı",
    description:
      "Girişimden kurumsallaşmaya, stratejik planlamadan organizasyon tasarımına kadar işletmenizi bir adım öteye taşıyoruz.",
    features: [
      "Girişim ve Kuruluş Danışmanlığı",
      "Stratejik Planlama",
      "Kurumsal Yapılanma ve Organizasyon",
    ],
    colors: {
      badge:    "bg-indigo-50 text-indigo-700 border-indigo-200",
      iconBg:   "bg-indigo-100",
      iconText: "text-indigo-600",
      check:    "text-indigo-500",
      border:   "border-indigo-100 hover:border-indigo-300",
      glow:     "hover:shadow-indigo-100",
    },
  },
  {
    id: "project",
    icon: Rocket,
    tag: "Grants & PM",
    title: "Proje Danışmanlığı",
    description:
      "TÜBİTAK, KOSGEB, AB ve diğer hibe programlarından yararlanmanız için proje yönetimi, hukuk ve finans desteği sağlıyoruz.",
    features: [
      "TÜBİTAK, Erasmus, KOSGEB, AB, Kalkınma Ajansları vb. Kurumsal Destek & Hibe Programlarına Yönelik Çözümler",
      "Proje Yönetimi Çözümleri",
      "Proje Yönetimi Hukuk Danışmanlığı",
      "Proje Yönetimi Finans Danışmanlığı",
    ],
    colors: {
      badge:    "bg-rose-50 text-rose-700 border-rose-200",
      iconBg:   "bg-rose-100",
      iconText: "text-rose-600",
      check:    "text-rose-500",
      border:   "border-rose-100 hover:border-rose-300",
      glow:     "hover:shadow-rose-100",
    },
  },
  {
    id: "brand",
    icon: Award,
    tag: "Branding",
    title: "Marka Danışmanlığı",
    description:
      "Markanızı tescil ettirmekten konumlandırmaya kadar güçlü ve sürdürülebilir bir marka kimliği oluşturmanıza destek oluyoruz.",
    features: [
      "Marka, Ürün, Proje ve Tasarım Patent & Tescil Çözümleri",
      "Marka Konumlandırma, Yönetim ve Analiz Çözümleri",
    ],
    colors: {
      badge:    "bg-amber-50 text-amber-700 border-amber-200",
      iconBg:   "bg-amber-100",
      iconText: "text-amber-600",
      check:    "text-amber-500",
      border:   "border-amber-100 hover:border-amber-300",
      glow:     "hover:shadow-amber-100",
    },
  },
  {
    id: "creative",
    icon: Palette,
    tag: "Creative & UI/UX",
    title: "Kreatif Tasarım Hizmetleri",
    description:
      "Logo'dan kurumsal kimliğe, dijital içerikten UI/UX tasarımına kadar markanızın görsel dilini kusursuz biçimde oluşturuyoruz.",
    features: [
      "Afiş, Broşür, Katalog Tasarımı Hizmetleri",
      "Logo Tasarımı Hizmetleri",
      "Kartvizit, Kurumsal Kimlik Çözümleri",
      "Sosyal Medya, Web Sitesi ve Dijital Medya Görsel/Video İçerik Tasarım Hizmetleri",
      "Görsel ve Video Çekim Hizmetleri",
      "UI / UX Tasarım Hizmetleri",
    ],
    colors: {
      badge:    "bg-purple-50 text-purple-700 border-purple-200",
      iconBg:   "bg-purple-100",
      iconText: "text-purple-600",
      check:    "text-purple-500",
      border:   "border-purple-100 hover:border-purple-300",
      glow:     "hover:shadow-purple-100",
    },
  },
];

const processSteps = [
  { step: "01", icon: Search,    title: "Analiz",       desc: "İhtiyaçlarınızı, mevcut durumunuzu ve hedeflerinizi derinlemesine analiz ediyoruz. Paydaş görüşmeleri ve veri incelemesiyle gerçek problemi tanımlıyoruz." },
  { step: "02", icon: Lightbulb, title: "Strateji",     desc: "Analiz bulgularına dayalı özelleştirilmiş bir strateji ve yol haritası hazırlıyoruz. Öncelikleri netleştiriyor, beklentileri yönetiyoruz." },
  { step: "03", icon: Wrench,    title: "Uygulama",     desc: "Agile metodolojisiyle hızlı ve şeffaf bir şekilde uygulama yapıyoruz. Düzenli check-in'lerle sizi her adımda bilgilendiriyoruz." },
  { step: "04", icon: LineChart, title: "Optimizasyon", desc: "Sonuçları ölçüyor, öğreniyor ve sürekli iyileştiriyoruz. Uzun vadeli başarı için süreci izlemeye ve geliştirmeye devam ediyoruz." },
];

export default function ServicesPage() {
  return (
    <div className="flex flex-col">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden animated-gradient py-32 md:py-40">
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute top-1/4 left-16 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl float" />
        <div className="absolute bottom-1/4 right-16 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl float" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 narrow-container text-center">
          <Badge className="mb-6 bg-white/10 text-white border-white/20">
            Neler Yapıyoruz?
          </Badge>
          <h1 className="heading-xl text-white mb-6">
            <span className="gradient-text">Hizmetlerimiz</span>
          </h1>
          <p className="body-lg text-slate-300 max-w-2xl mx-auto">
            İşletmenizin dijital yolculuğunu baştan sona desteklemek için yazılımdan tasarıma,
            pazarlamadan danışmanlığa kadar 10 temel alanda uzman hizmetler sunuyoruz.
          </p>
        </div>
      </section>

      {/* ── Services Grid ── */}
      <section className="section bg-slate-50">
        <div className="page-container">
          <div className="section-header mb-14">
            <Badge className="mb-5 bg-blue-50 text-blue-700 border-blue-200">
              Hizmet Kategorilerimiz
            </Badge>
            <h2 className="heading-lg text-slate-900 mb-5">
              Her İhtiyacınız İçin Doğru Çözüm
            </h2>
            <p className="body-lg text-slate-500 max-w-xl mx-auto">
              Aşağıdaki kategorilerden herhangi biri için bizimle iletişime geçebilirsiniz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                id={service.id}
                className={cn(
                  "bg-white rounded-2xl p-7 border-2 transition-all duration-300 hover:shadow-xl flex flex-col",
                  service.colors.border,
                  service.colors.glow,
                )}
              >
                {/* Card Header */}
                <div className="flex items-start gap-4 mb-5">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                    service.colors.iconBg,
                  )}>
                    <service.icon className={cn("w-6 h-6", service.colors.iconText)} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-1">
                      {service.tag}
                    </span>
                    <Badge className={cn("text-xs", service.colors.badge)}>
                      {service.title}
                    </Badge>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-2.5 flex-1">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <CheckCircle2 className={cn("w-4 h-4 mt-0.5 flex-shrink-0", service.colors.check)} />
                      <span className="text-slate-700 text-sm leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process ── */}
      <section className="section bg-slate-900">
        <div className="page-container">
          <div className="section-header">
            <Badge className="mb-5 bg-white/10 text-white border-white/20">
              Çalışma Metodolojimiz
            </Badge>
            <h2 className="heading-lg text-white mb-5">
              4 Adımda Başarıya
            </h2>
            <p className="body-lg text-slate-400 max-w-xl mx-auto">
              Her projede aynı titizlikle uyguladığımız metodolojimiz,
              tekrarlanabilir başarının temelidir.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {processSteps.map((step, i) => (
              <div
                key={step.step}
                className="relative bg-slate-800 rounded-2xl p-7 border border-slate-700/80 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group"
              >
                {i < processSteps.length - 1 && (
                  <div className="hidden xl:block absolute top-1/2 -right-3 w-6 h-px bg-slate-600 z-10" />
                )}
                <div className="text-6xl font-black text-slate-700/50 mb-5 leading-none select-none">
                  {step.step}
                </div>
                <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600/30 transition-colors duration-300">
                  <step.icon className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2.5">{step.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section animated-gradient relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 narrow-container text-center">
          <h2 className="heading-lg text-white mb-6">
            Hangi Hizmete İhtiyacınız Var?
          </h2>
          <p className="body-lg text-slate-300 mb-10 max-w-lg mx-auto">
            Keşif görüşmesinde ihtiyaçlarınızı anlayalım ve size özel
            bir teklif hazırlayalım.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="gradient" size="xl" asChild>
              <Link href="/contact">
                Görüşme Talep Et
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              size="xl"
              className="border-2 border-white/25 text-white bg-white/8 hover:bg-white/15 hover:-translate-y-0.5 transition-all"
              asChild
            >
              <Link href="/projects">Projelerimizi İncele</Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}