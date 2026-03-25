"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Rocket, Code2, BarChart3, Cpu, ChevronDown,
  Globe, Shield, TrendingUp, Users, Star,
  ArrowRight, CheckCircle2, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/* ── Animated counter ─────────────────────────────────────────────── */
function Counter({ target, suffix = "", duration = 2000 }: {
  target: number; suffix?: string; duration?: number;
}) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let startTime: number;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ── Data ─────────────────────────────────────────────────────────── */
const services = [
  {
    icon: Rocket,
    title: "Proje Danışmanlığı",
    description: "Dijital projelerinizi baştan sona yönetiyor, doğru metodoloji ve araçlarla zamanında teslim edilmesini sağlıyoruz.",
    href: "/services#project",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    accentColor: "group-hover:border-blue-200",
    tag: "PM & Agile",
  },
  {
    icon: Code2,
    title: "Yazılım Danışmanlığı",
    description: "Modern yazılım mimarisi, teknoloji seçimi ve geliştirme süreçlerinde uzman rehberlik sunuyoruz.",
    href: "/services#software",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    accentColor: "group-hover:border-violet-200",
    tag: "Tech & Architecture",
  },
  {
    icon: BarChart3,
    title: "Dijital Pazarlama",
    description: "SEO, içerik stratejisi ve dijital reklamcılıkla hedef kitlenize ulaşıp büyümenizi hızlandırıyoruz.",
    href: "/services#marketing",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    accentColor: "group-hover:border-emerald-200",
    tag: "Growth & SEO",
  },
  {
    icon: Cpu,
    title: "Kendi Ürünlerimiz",
    description: "Sektöre özel geliştirdiğimiz SaaS çözümleri ve açık kaynak araçlarımızla iş süreçlerinizi optimize edin.",
    href: "/projects",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
    accentColor: "group-hover:border-orange-200",
    tag: "SaaS & Open Source",
  },
];

const whyOrtisoft = [
  "6 yılı aşkın sektör deneyimi ve 120+ başarılı proje",
  "Agile & Scrum metodolojisiyle şeffaf proje yönetimi",
  "Her sektöre özel çözümler ve teknoloji bağımsız yaklaşım",
  "Proje sonrası teknik destek ve sürekli optimizasyon",
];

const featureCards = [
  { icon: Globe,      title: "Global Standartlar",  desc: "Uluslararası yazılım geliştirme standartlarını Türkiye pazarına uyarlıyoruz." },
  { icon: Shield,     title: "Güvenlik Odaklı",      desc: "KVKK uyumlu, güvenli ve ölçeklenebilir çözümler tasarlıyoruz." },
  { icon: TrendingUp, title: "Ölçülebilir Sonuçlar", desc: "Her proje için net KPI'lar belirler, ilerlemeyi şeffaf şekilde raporlarız." },
  { icon: Users,      title: "Uzman Ekip",           desc: "Yazılım, pazarlama ve proje yönetiminde uzman kadromuzla yanınızdayız." },
];

const testimonials = [
  {
    name: "Ahmet Kaya",
    role: "CEO, TechVentures",
    text: "Ortisoft ile çalışmak işimizin seyrini değiştirdi. Yazılım altyapımızı tamamen yenilediler ve e-ticaret satışlarımız 3 ayda %40 arttı. Profesyonellik ve iletişim konusunda gerçekten örnek bir ekip.",
    stars: 5,
    initials: "AK",
    color: "from-blue-500 to-blue-600",
  },
  {
    name: "Merve Demir",
    role: "Pazarlama Direktörü, RetailPlus",
    text: "Dijital pazarlama stratejimizi sıfırdan kuruyorlardı. SEO çalışmaları sayesinde organik trafiğimiz 6 ayda 4 katına çıktı. Her adımda neler yaptıklarını açıkça anlattılar.",
    stars: 5,
    initials: "MD",
    color: "from-violet-500 to-violet-600",
  },
  {
    name: "Selim Arslan",
    role: "Kurucu, StartupHub",
    text: "Proje danışmanlığı hizmeti aldık ve sonuçlar beklentilerimizin çok üzerinde oldu. Zamanında teslimat ve bütçe yönetimi mükemmeldi. Kesinlikle tekrar çalışacağız.",
    stars: 5,
    initials: "SA",
    color: "from-emerald-500 to-emerald-600",
  },
];

/* ── Page ─────────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div className="flex flex-col">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden animated-gradient">
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute top-1/4 left-12 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl float" />
        <div className="absolute bottom-1/4 right-12 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold mb-8 backdrop-blur-sm">
            <Zap size={14} className="text-blue-300" />
            Dijital Dönüşüm Ortağınız
          </div>

          <h1 className="heading-xl text-white mb-7">
            İşletmenizi
            <br />
            <span className="gradient-text">Dijital Geleceğe</span>
            <br />
            Taşıyoruz
          </h1>

          <p className="body-lg text-slate-300 mb-12 max-w-2xl mx-auto">
            Proje danışmanlığı, yazılım mimarisi ve dijital pazarlama
            hizmetleriyle işletmenizi büyütüyoruz.{" "}
            <span className="text-blue-300 font-semibold">6 yıllık deneyim, 120+ başarılı proje.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button variant="gradient" size="xl" asChild>
              <Link href="/contact">
                Görüşme Talep Et
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              size="xl"
              className="border-2 border-white/25 text-white bg-white/8 hover:bg-white/15 hover:-translate-y-0.5 transition-all backdrop-blur-sm"
              asChild
            >
              <Link href="/services">Hizmetlerimizi Keşfet</Link>
            </Button>
          </div>

          {/* Social proof */}
          <div className="inline-flex items-center gap-4 px-5 py-3 rounded-2xl bg-white/8 border border-white/12 backdrop-blur-sm">
            <div className="flex -space-x-2.5">
              {["AK", "MD", "SA", "EÇ"].map((initial, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 border-2 border-white/25 flex items-center justify-center text-white text-xs font-bold"
                >
                  {initial}
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="flex gap-0.5 mb-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-300 text-xs">
                <span className="text-white font-semibold">85+ müşteri</span> bize güveniyor
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-white/35" />
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────── */}
      <section className="bg-slate-950 py-16">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Başarılı Proje", target: 120, suffix: "+" },
              { label: "Mutlu Müşteri",  target: 85,  suffix: "+" },
              { label: "Yıl Deneyim",    target: 6,   suffix: "+" },
              { label: "Memnuniyet",     target: 98,  suffix: "%" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-2">
                <div className="text-4xl md:text-5xl font-extrabold gradient-text">
                  <Counter target={stat.target} suffix={stat.suffix} duration={2200} />
                </div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ──────────────────────────────────────────────── */}
      <section className="section bg-slate-50">
        <div className="page-container">
          <div className="section-header">
            <Badge className="mb-4">Hizmetlerimiz</Badge>
            <h2 className="heading-lg text-slate-900 mb-5">
              Size Nasıl Yardımcı Olabiliriz?
            </h2>
            <p className="body-lg text-slate-500 max-w-xl mx-auto">
              İşletmenizin dijital dönüşümünü hızlandırmak için kapsamlı hizmetler sunuyoruz.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {services.map((service) => (
              <Link
                key={service.title}
                href={service.href}
                className={cn(
                  "group bg-white rounded-2xl p-7 border border-slate-100 shadow-sm flex flex-col transition-all duration-300",
                  "hover:-translate-y-2 hover:shadow-xl hover:shadow-slate-200/60",
                  service.accentColor
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110",
                  service.iconBg
                )}>
                  <service.icon className={cn("w-6 h-6", service.iconColor)} />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {service.tag}
                </span>
                <h3 className="text-slate-900 font-bold text-lg mb-3">{service.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed flex-1">{service.description}</p>
                <div className="flex items-center gap-1.5 mt-5 text-sm font-bold text-blue-600 group-hover:gap-3 transition-all duration-200">
                  Detaylar <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Ortisoft ──────────────────────────────────────────── */}
      <section className="section bg-white">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-center">

            {/* Left */}
            <div className="max-w-lg">
              <Badge className="mb-5">Neden Ortisoft?</Badge>
              <h2 className="heading-lg text-slate-900 mb-6">
                Dijital Dönüşümde{" "}
                <span className="gradient-text">Güvenilir Ortağınız</span>
              </h2>
              <p className="body-lg text-slate-500 mb-8">
                2019&apos;dan bu yana yüzlerce işletmenin dijital yolculuğuna rehberlik ettik.
                Sadece kod yazmıyoruz — iş süreçlerinizi anlıyor, stratejik çözümler üretiyor
                ve uzun vadeli başarınız için çalışıyoruz.
              </p>
              <ul className="space-y-4 mb-10">
                {whyOrtisoft.map((item) => (
                  <li key={item} className="flex items-start gap-3.5">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <span className="text-slate-600 leading-relaxed text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Button variant="gradient" size="lg" asChild>
                <Link href="/about">
                  Hakkımızda Daha Fazla
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>

            {/* Right: feature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {featureCards.map((card, i) => (
                <div
                  key={card.title}
                  className={cn(
                    "rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                    i % 2 === 0
                      ? "bg-slate-50 border-slate-100 hover:border-blue-100"
                      : "bg-blue-600 border-blue-600 text-white"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center mb-4",
                    i % 2 === 0 ? "bg-blue-100" : "bg-white/20"
                  )}>
                    <card.icon className={cn("w-5 h-5", i % 2 === 0 ? "text-blue-600" : "text-white")} />
                  </div>
                  <h4 className={cn("font-bold text-base mb-2", i % 2 === 0 ? "text-slate-900" : "text-white")}>
                    {card.title}
                  </h4>
                  <p className={cn("text-sm leading-relaxed", i % 2 === 0 ? "text-slate-500" : "text-blue-100")}>
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────── */}
      <section className="section bg-slate-50">
        <div className="page-container">
          <div className="section-header">
            <Badge className="mb-4">Müşteri Görüşleri</Badge>
            <h2 className="heading-lg text-slate-900 mb-5">
              Müşterilerimiz Ne Diyor?
            </h2>
            <p className="body-lg text-slate-500">
              Başarı hikayelerimiz en iyi referansımızdır.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-100 transition-all duration-300 flex flex-col"
              >
                <div className="flex gap-1 mb-5">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 leading-relaxed mb-8 flex-1 text-sm">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-4 pt-5 border-t border-slate-100">
                  <div className={cn(
                    "w-11 h-11 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-sm font-bold flex-shrink-0",
                    t.color
                  )}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <section className="section animated-gradient relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 narrow-container text-center">
          <h2 className="heading-lg text-white mb-6">
            Projenizi Birlikte{" "}
            <span className="gradient-text">Hayata Geçirelim</span>
          </h2>
          <p className="body-lg text-slate-300 mb-10 max-w-lg mx-auto">
            Projenizi konuşmak için bize ulaşın. İhtiyaçlarınızı dinleyip
            size özel bir yol haritası çıkaralım.
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
              <Link href="/projects">Projelerimizi Gör</Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}