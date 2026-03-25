"use client";

import Link from "next/link";
import {
  Rocket, Code2, BarChart3, Cpu, ArrowRight,
  CheckCircle2, Search, Lightbulb, Wrench, LineChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const services = [
  {
    id: "project",
    icon: Rocket,
    tag: "PM & Agile",
    title: "Proje Danışmanlığı",
    subtitle: "Projelerinizi Zamanında ve Bütçe Dahilinde Teslim Ediyoruz",
    description:
      "Dijital projenizin her aşamasında yanınızdayız. Gereksinim analizinden başlayarak proje planlaması, kaynak yönetimi, risk analizi ve başarılı teslimat sürecine kadar kapsamlı destek sağlıyoruz. Agile ve Scrum metodolojileriyle projenizi şeffaf biçimde yönetiyor, her sprint sonunda somut çıktılar sunuyoruz.",
    features: [
      "Kapsamlı gereksinim analizi ve iş akışı haritalama",
      "Agile/Scrum tabanlı proje yönetimi",
      "Detaylı proje planı ve milestone takibi",
      "Risk analizi ve azaltma stratejileri",
      "Kaynak planlama ve ekip koordinasyonu",
      "Düzenli ilerleme raporları ve paydaş iletişimi",
      "Kalite güvencesi ve test süreçleri",
      "Proje sonrası değerlendirme ve öğrenimler",
    ],
    colors: {
      badge:    "bg-blue-50 text-blue-700 border-blue-200",
      iconBg:   "bg-blue-50",
      iconText: "text-blue-600",
      check:    "text-blue-500",
      cardBg:   "bg-blue-50/50",
      border:   "border-blue-100 hover:border-blue-300",
    },
  },
  {
    id: "software",
    icon: Code2,
    tag: "Tech & Architecture",
    title: "Yazılım Danışmanlığı",
    subtitle: "Doğru Teknolojiyle Güçlü Yazılım Mimarileri",
    description:
      "Yazılım geliştirme sürecinizde stratejik kararlar almak için uzman görüş ve rehberlik sunuyoruz. Mevcut sistemlerinizi analiz edip iyileştirme fırsatları belirliyoruz; yeni projeler için en uygun teknoloji yığını, mimari deseni ve geliştirme yaklaşımını birlikte tasarlıyoruz.",
    features: [
      "Mevcut sistem analizi ve teknik borç değerlendirmesi",
      "Teknoloji yığını seçimi ve mimari tasarım",
      "Mikroservis ve monolitik mimari değerlendirmesi",
      "API tasarımı ve entegrasyon stratejileri",
      "Cloud geçiş planlaması (AWS, Azure, GCP)",
      "DevOps ve CI/CD süreç danışmanlığı",
      "Kod kalitesi standartları ve best practice rehberliği",
      "Performans optimizasyonu ve ölçeklendirme",
    ],
    colors: {
      badge:    "bg-violet-50 text-violet-700 border-violet-200",
      iconBg:   "bg-violet-50",
      iconText: "text-violet-600",
      check:    "text-violet-500",
      cardBg:   "bg-violet-50/50",
      border:   "border-violet-100 hover:border-violet-300",
    },
  },
  {
    id: "marketing",
    icon: BarChart3,
    tag: "Growth & SEO",
    title: "Dijital Pazarlama Danışmanlığı",
    subtitle: "Hedef Kitlenize Ulaşın, Büyümenizi Hızlandırın",
    description:
      "Dijital pazarlama dünyasında fark yaratmak için veri odaklı stratejiler geliştiriyoruz. SEO'dan sosyal medyaya, içerik pazarlamasından ücretli reklamlara kadar bütüncül bir dijital varlık oluşturmanıza yardımcı oluyoruz. Her kanal için özelleştirilmiş yaklaşımlarla ROI'nizi maksimize ediyoruz.",
    features: [
      "SEO stratejisi ve teknik optimizasyon",
      "İçerik pazarlama stratejisi ve editöryal takvim",
      "Google Ads ve Meta Ads kampanya yönetimi",
      "Sosyal medya stratejisi ve içerik planlaması",
      "E-posta pazarlama otomasyonu",
      "Dönüşüm optimizasyonu (CRO)",
      "Analytics kurulumu ve raporlama",
      "Rekabet analizi ve pazar araştırması",
    ],
    colors: {
      badge:    "bg-emerald-50 text-emerald-700 border-emerald-200",
      iconBg:   "bg-emerald-50",
      iconText: "text-emerald-600",
      check:    "text-emerald-500",
      cardBg:   "bg-emerald-50/50",
      border:   "border-emerald-100 hover:border-emerald-300",
    },
  },
  {
    id: "digital",
    icon: Cpu,
    tag: "Transformation",
    title: "Dijital Dönüşüm",
    subtitle: "İş Modelinizi Geleceğe Hazırlayın",
    description:
      "Dijital dönüşüm yalnızca teknoloji değişikliği değil; süreç, kültür ve iş modelinin yeniden tasarlanmasıdır. Şirketinizin mevcut durumunu analiz ediyor, dönüşüm yol haritası hazırlıyor ve uygulama sürecinde stratejik rehberlik sunuyoruz. İnsan merkezli yaklaşımımızla ekibinizi de bu yolculuğa dahil ediyoruz.",
    features: [
      "Dijital olgunluk değerlendirmesi",
      "Dönüşüm yol haritası ve önceliklendirme",
      "İş süreci otomasyonu (RPA, workflow)",
      "Veri stratejisi ve analitik olgunlaşma",
      "Değişim yönetimi ve çalışan eğitimi",
      "ERP, CRM ve kurumsal sistem entegrasyonları",
      "Müşteri deneyimi dijitalleşmesi",
      "Dijital KPI'lar ve başarı metrikleri",
    ],
    colors: {
      badge:    "bg-orange-50 text-orange-700 border-orange-200",
      iconBg:   "bg-orange-50",
      iconText: "text-orange-600",
      check:    "text-orange-500",
      cardBg:   "bg-orange-50/50",
      border:   "border-orange-100 hover:border-orange-300",
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
          <p className="body-lg text-slate-300 max-w-xl mx-auto">
            İşletmenizin dijital yolculuğunu baştan sona desteklemek için dört temel alanda
            uzman danışmanlık hizmetleri sunuyoruz.
          </p>
        </div>
      </section>

      {/* ── Service Sections ── */}
      {services.map((service, index) => (
        <section
          key={service.id}
          id={service.id}
          className={cn("py-20 md:py-28", index % 2 === 0 ? "bg-white" : "bg-slate-50")}
        >
          <div className="page-container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-start">

              {/* Content */}
              <div className={cn("max-w-xl", index % 2 !== 0 && "lg:order-2")}>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 block">
                  {service.tag}
                </span>
                <Badge className={cn("mb-5", service.colors.badge)}>
                  {service.title}
                </Badge>
                <h2 className="heading-md text-slate-900 mb-5">
                  {service.subtitle}
                </h2>
                <p className="text-slate-500 leading-relaxed mb-10 text-base">
                  {service.description}
                </p>
                <Button variant="gradient" size="lg" asChild>
                  <Link href="/contact">
                    Bu Hizmet Hakkında Konuşalım
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              </div>

              {/* Features Card */}
              <div className={cn(index % 2 !== 0 && "lg:order-1")}>
                <div className={cn(
                  "rounded-2xl p-8 border-2 transition-all duration-300 hover:shadow-xl",
                  service.colors.cardBg,
                  service.colors.border,
                )}>
                  <div className="flex items-center gap-4 mb-8">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                      service.colors.iconBg
                    )}>
                      <service.icon className={cn("w-6 h-6", service.colors.iconText)} />
                    </div>
                    <div>
                      <h3 className="text-slate-900 font-bold text-lg">Neler Dahil?</h3>
                      <p className="text-slate-400 text-xs mt-1">{service.features.length} özellik</p>
                    </div>
                  </div>
                  <ul className="space-y-4">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <CheckCircle2 className={cn("w-5 h-5 mt-0.5 flex-shrink-0", service.colors.check)} />
                        <span className="text-slate-700 text-sm leading-relaxed font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </section>
      ))}

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