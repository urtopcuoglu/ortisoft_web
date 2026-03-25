"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Github, Star, ArrowRight, Zap, Package, Code2, Rocket, MessageSquare, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Projects data artık kullanılmıyor - Coming Soon sayfası için
// Eski projeler veri tabanında korunmuştur

export default function ProjectsPage() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <div className="flex flex-col">

      {/* ── Coming Soon Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden animated-gradient py-20">
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl float" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl float" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 narrow-container text-center max-w-2xl mx-auto px-4">
          {/* Badge */}
          <Badge className="mb-8 bg-white/10 text-white border-white/20 justify-center mx-auto inline-flex">
            <Zap className="w-4 h-4 mr-2" />
            Yeni Ürün Hazırlığında
          </Badge>

          {/* Main Heading */}
          <h1 className="heading-xl text-white mb-8 leading-tight">
            Projelerimiz <br />
            <span className="gradient-text">Yakında Sunulacak</span>
          </h1>

          {/* Description */}
          <p className="body-lg text-slate-300 mb-12 max-w-xl mx-auto leading-relaxed">
            Ürün portföyümüzü yeniden düzenliyor, daha iyi örnekler ve başarı hikayeleri hazırlıyoruz.
            Güncellemelerden haberdar olmak için e-mail adresinizi bırakın.
          </p>

          {/* Email Subscribe */}
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto mb-12">
            <input
              type="email"
              placeholder="E-mail adresiniz..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 backdrop-blur-sm"
            />
            <button
              type="submit"
              className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {subscribed ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Subscribed
                </>
              ) : (
                <>
                  Bildirim Al
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Stats/Timeline */}
          <div className="grid grid-cols-3 gap-6 max-w-md mx-auto mb-14">
            {[
              { number: "50+", text: "Proje" },
              { number: "500+", text: "Şirket" },
              { number: "99.9%", text: "Uptime" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl font-black gradient-text mb-1">{stat.number}</div>
                <div className="text-xs sm:text-sm text-slate-400 font-medium">{stat.text}</div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="gradient" size="lg" asChild>
              <Link href="/services">
                Hizmetlerimiz
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" size="lg" asChild>
              <Link href="/contact">
                <MessageSquare className="w-5 h-5" />
                İletişim Kurun
              </Link>
            </Button>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute bottom-10 left-10 w-20 h-20 border border-white/10 rounded-2xl animate-pulse" />
        <div className="absolute top-20 right-10 w-16 h-16 border-2 border-blue-400/30 rounded-full" />
      </section>

      {/* ── What's Coming ── */}
      <section className="py-20 md:py-28 bg-slate-900">
        <div className="page-container">
          <div className="text-center mb-16">
            <h2 className="heading-lg text-white mb-4">
              Hazırlanıyor: <span className="gradient-text">Portföyümüz</span>
            </h2>
            <p className="body-lg text-slate-400 max-w-lg mx-auto">
              Geçmiş başarılarımız, müşteri referansları ve derinlemesine proje incelemeleri
            </p>
          </div>

          {/* Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Package className="w-8 h-8" />,
                title: "SaaS Ürünleri",
                desc: "Şu anda geliştirdiğimiz 8+ ürünün detaylı incelemesi",
                color: "from-blue-500/20 to-blue-600/20",
              },
              {
                icon: <Code2 className="w-8 h-8" />,
                title: "Kurumsal Çözümler",
                desc: "İşletmelerin dijital dönüşümünde sağladığımız değer hikayeler",
                color: "from-violet-500/20 to-violet-600/20",
              },
              {
                icon: <Rocket className="w-8 h-8" />,
                title: "Açık Kaynak",
                desc: "Katılım sağladığımız ve geliştirdiğimiz açık kaynak projeler",
                color: "from-emerald-500/20 to-emerald-600/20",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`bg-gradient-to-br ${item.color} border border-slate-700 rounded-2xl p-8 text-center hover:border-slate-600 transition-colors duration-300`}
              >
                <div className="text-slate-400 mb-4 flex justify-center">{item.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
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