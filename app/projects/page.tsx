"use client";

import Link from "next/link";
import {
  ArrowRight, CheckCircle2,
  Store, Leaf, Train,
  Briefcase, Award, Layers, Clock, Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ProjectStatus = "coming_soon" | "in_development" | "active";

interface Project {
  id: string;
  title: string;
  status: ProjectStatus;
  badge: string;
  fundingLabel: string;
  fundingBadgeColor: string;
  tagline: string;
  description: string;
  tags: string[];
  iconName: "Store" | "Leaf" | "Train";
  gradient: string;
  borderColor: string;
  features: string[];
  techStack?: string[];
}

const projects: Project[] = [
  {
    id: "dukkanimbenim",
    title: "dükkanımbenim.com",
    status: "coming_soon",
    badge: "Çok Yakında",
    fundingLabel: "Ortisoft Girişimi",
    fundingBadgeColor: "bg-slate-700 text-slate-300 border-slate-600",
    tagline: "KOBİ'ler için hepsi bir arada dijital vitrin & CRM platformu",
    description:
      "Küçük ve orta ölçekli işletmelerin online varlıklarını kolayca yönetebilecekleri, müşteri ilişkilerini takip edebilecekleri ve satışlarını dijitale taşıyabilecekleri SaaS platformu. Kurulum gerektirmez, dakikalar içinde kullanıma hazır.",
    tags: ["SaaS", "CRM", "E-Ticaret", "KOBİ"],
    iconName: "Store",
    gradient: "from-orange-500/20 to-amber-500/20",
    borderColor: "border-orange-500/30",
    features: [
      "Dijital vitrin & ürün kataloğu",
      "Müşteri ve sipariş yönetimi",
      "WhatsApp & sosyal medya entegrasyonu",
      "Analitik dashboard",
    ],
  },
  {
    id: "greeneco-map",
    title: "GreenEco Map",
    status: "in_development",
    badge: "Geliştiriliyor",
    fundingLabel: "TÜBİTAK BİGG",
    fundingBadgeColor: "bg-red-900/40 text-red-300 border-red-700/50",
    tagline: "Kahve telvesi geri dönüşüm ekosistemi — IoT + Gamification",
    description:
      "ESP32 tabanlı akıllı geri dönüşüm kutuları, mobil uygulama ve B2B/B2C gelir modeli ile kahve telvesini döngüsel ekonomiye kazandıran sürdürülebilirlik platformu. Kullanıcılar atıklarını bırakır, puan kazanır; üreticiler hammadde temin eder.",
    tags: ["IoT", "Sürdürülebilirlik", "ESP32", "Gamification", "TÜBİTAK BİGG"],
    iconName: "Leaf",
    gradient: "from-emerald-500/20 to-green-500/20",
    borderColor: "border-emerald-500/30",
    features: [
      "Akıllı IoT kutu ağı (IP65, load cell, drainage valve)",
      "Puan & ödül gamification sistemi",
      "B2B hammadde tedarik modülü",
      "Gerçek zamanlı doluluk & analitik dashboard",
    ],
    techStack: [
      ".NET 8",
      "Next.js 14",
      "PostgreSQL",
      "TimescaleDB",
      "Redis",
      "RabbitMQ",
      "SignalR",
      "Capacitor",
    ],
  },
  {
    id: "railmentor",
    title: "RailMentor",
    status: "in_development",
    badge: "Geliştiriliyor",
    fundingLabel: "Erasmus+ KA210-VET",
    fundingBadgeColor: "bg-blue-900/40 text-blue-300 border-blue-700/50",
    tagline: "Demiryolu sektörüne adım atacak gençler için dijital mentorlük platformu",
    description:
      "Gazi MTAL koordinatörlüğünde yürütülen Erasmus+ girişimi. 14–18 yaş arası öğrencileri sektör profesyonelleriyle buluşturan akıllı eşleştirme algoritması, gerçek zamanlı iletişim ve multimedya içerik kütüphanesiyle donatılmış mentorlük platformu.",
    tags: ["Erasmus+", "EdTech", "Mentorlük", "Demiryolu", "KA210-VET"],
    iconName: "Train",
    gradient: "from-blue-500/20 to-indigo-500/20",
    borderColor: "border-blue-500/30",
    features: [
      "Akıllı mentor-menti eşleştirme motoru (dezavantajlı grup önceliği)",
      "SignalR tabanlı anlık mesajlaşma & bildirim sistemi",
      "Görev atama, dijital geri bildirim & süreç takibi",
      "Podcast, video & e-öğrenme multimedya kütüphanesi",
      "Admin KPI dashboard & öğrenci ilerleme analitikleri",
      "Türkçe / İngilizce çok dil desteği (next-intl)",
    ],
    techStack: [
      ".NET 8",
      "Next.js 14",
      "PostgreSQL",
      "RabbitMQ",
      "Redis",
      "SignalR",
      "MinIO",
      "Capacitor",
    ],
  },
];

export default function ProjectsPage() {
  return (
    <div className="flex flex-col">

      {/* ── Hero ── */}
      <section className="relative min-h-[60vh] flex flex-col items-center justify-center overflow-hidden bg-slate-950 py-24">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl" />

        <div className="relative z-10 narrow-container px-4">
          {/* Üst badge — çift pill */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <Badge className="bg-white/10 text-white border-white/20">
              <Briefcase className="w-3.5 h-3.5 mr-1.5" />
              3 Aktif Proje
            </Badge>
            <Badge className="bg-white/10 text-white border-white/20">
              <Award className="w-3.5 h-3.5 mr-1.5" />
              Erasmus+ · TÜBİTAK BİGG destekli
            </Badge>
          </div>

          {/* Ana başlık */}
          <h1 className="heading-xl text-white mb-6 leading-tight text-center">
            Fikri Ürüne,<br />
            <span className="gradient-text">Ürünü Gerçeğe Dönüştürüyoruz</span>
          </h1>

          {/* Alt açıklama */}
          <p className="body-lg text-slate-300 mb-10 max-w-2xl mx-auto text-center leading-relaxed">
            Kendi geliştirdiğimiz SaaS ürünlerinden uluslararası fon destekli
            araştırma projelerine — her çalışmamızda gerçek iş problemlerini
            ölçeklenebilir yazılımla çözüyoruz.
          </p>

          {/* 3 metrik kutu */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-10">
            {[
              { number: "3", label: "Aktif Proje", icon: <Layers className="w-5 h-5" /> },
              { number: "2", label: "Uluslararası Fon", icon: <Award className="w-5 h-5" /> },
              { number: "6+", label: "Yıllık Deneyim", icon: <Clock className="w-5 h-5" /> },
            ].map((stat, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-4 py-5"
              >
                <div className="text-blue-400">{stat.icon}</div>
                <div className="text-2xl font-black gradient-text">{stat.number}</div>
                <div className="text-xs text-slate-400 font-medium text-center">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* CTA butonları */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="gradient" size="lg" asChild>
              <Link href="/contact">
                Proje Görüşmesi Başlat
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" size="lg" asChild>
              <Link href="/services">
                <Code2 className="w-5 h-5" />
                Hizmetlerimiz
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Projeler ── */}
      <section className="py-20 md:py-28 bg-slate-900">
        <div className="page-container">
          <div className="text-center mb-16">
            <h2 className="heading-lg text-white mb-4">
              Ürün <span className="gradient-text">Portföyümüz</span>
            </h2>
            <p className="body-lg text-slate-400 max-w-lg mx-auto">
              Geliştirdiğimiz ve yakında hayata geçireceğimiz projeler
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project) => {
              const Icon =
                project.iconName === "Store"
                  ? Store
                  : project.iconName === "Leaf"
                  ? Leaf
                  : Train;

              return (
                <div
                  key={project.id}
                  className={cn(
                    "bg-gradient-to-br border rounded-2xl p-8 flex flex-col gap-5",
                    "hover:border-opacity-60 transition-all duration-300",
                    project.gradient,
                    project.borderColor
                  )}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="text-slate-300">
                        <Icon className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-bold text-white">{project.title}</h3>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span
                        className={cn(
                          "text-xs px-2.5 py-1 rounded-full font-semibold border",
                          project.status === "coming_soon"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : "bg-blue-500/20 text-blue-300 border-blue-500/40"
                        )}
                      >
                        {project.badge}
                      </span>
                      <span
                        className={cn(
                          "text-xs px-2.5 py-1 rounded-full font-semibold border",
                          project.fundingBadgeColor
                        )}
                      >
                        {project.fundingLabel}
                      </span>
                    </div>
                  </div>

                  {/* Tagline + Description */}
                  <div>
                    <p className="text-base font-semibold text-white mb-2">{project.tagline}</p>
                    <p className="text-slate-400 text-sm leading-relaxed">{project.description}</p>
                  </div>

                  {/* Features */}
                  <ul className="flex flex-col gap-2">
                    {project.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* Tech Stack */}
                  {project.techStack && (
                    <div className="flex flex-wrap gap-2 pt-1 border-t border-white/10">
                      {project.techStack.map((t) => (
                        <span
                          key={t}
                          className="text-xs font-mono px-2 py-1 rounded bg-slate-800/60 text-slate-400 border border-slate-700/50"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge
                        key={tag}
                        className="bg-white/10 text-slate-300 border-white/20 text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Timeline/Progress ── */}
      <section className="py-20 md:py-28 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="relative z-10 page-container">
          <div className="text-center mb-16">
            <h2 className="heading-lg text-white mb-4">
              Yayın <span className="gradient-text">Takvimi</span>
            </h2>
          </div>

          <div className="max-w-2xl mx-auto">
            {[
              { month: "Nisan", year: "2026", title: "Portföy Sitesi Canlı", status: "active" },
              { month: "Mayıs", year: "2026", title: "İlk Proje Detayları", status: "pending" },
              { month: "Haziran", year: "2026", title: "Müşteri Referansları", status: "pending" },
            ].map((timeline, i) => (
              <div key={i} className="flex gap-6 mb-8 last:mb-0">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 border-slate-600",
                    timeline.status === "active" && "bg-blue-500 border-blue-500 shadow-lg shadow-blue-500/50"
                  )} />
                  {i < 2 && <div className="w-0.5 h-16 bg-gradient-to-b from-slate-600 to-transparent mt-4" />}
                </div>
                <div className="pt-1">
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-sm font-bold text-blue-400">{timeline.month} {timeline.year}</span>
                    <span className={cn(
                      "text-xs px-2.5 py-1 rounded-full font-semibold",
                      timeline.status === "active"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    )}>
                      {timeline.status === "active" ? "Şu An" : "Yakında"}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{timeline.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Footer ── */}
      <section className="py-20 md:py-28 animated-gradient relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 narrow-container text-center">
          <h2 className="heading-lg text-white mb-6">
            Bu Arada, Bize <span className="gradient-text">Ulaşın</span>
          </h2>
          <p className="body-lg text-slate-300 mb-10 max-w-lg mx-auto">
            Hizmetlerimiz veya özel çözümler hakkında bilgi almak isterseniz, ekibimizle konuşabilirsiniz.
          </p>
          <Button variant="gradient" size="xl" asChild>
            <Link href="/contact">
              Bağlantı Kurun <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

    </div>
  );
}