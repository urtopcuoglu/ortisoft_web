import Link from "next/link";
import Image from "next/image";
import {
  Clock, Sparkles, Rocket, TrendingUp, Users, Award,
  ArrowRight, CheckCircle2, Building2, Mail, Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const sneakPeek = [
  { name: "Kasırga Bilgisayar", logo: "/referances/kasirga.png" },
  { name: "Railmentor",         logo: "/referances/railmentor.png" },
  { name: "Eatwellz",           logo: "/referances/eatwellz.png" },
  { name: "Gatem",              logo: "/referances/gatem.png" },
  { name: "Sosyolojik Müdahale", logo: "/referances/sosyolojikmüdahele.png" },
  { name: "Ortisoft Partner",   logo: "/brand-logo/shopify.png" },
];

const stats = [
  { icon: Users,      number: "85+",  label: "Mutlu Müşteri" },
  { icon: Building2,  number: "120+", label: "Tamamlanan Proje" },
  { icon: TrendingUp, number: "6+",   label: "Yıllık Deneyim" },
];

const steps = [
  { icon: CheckCircle2, title: "Başarı Hikâyeleri Derleniyor", done: true },
  { icon: Sparkles,     title: "Vaka Analizleri Hazırlanıyor", done: false },
  { icon: Rocket,       title: "Referanslar Sayfası Yayında",  done: false },
];

export default function ReferencesPage() {
  return (
    <div className="flex flex-col">

      {/* ── Hero ── */}
      <section className="relative py-32 md:py-40 overflow-hidden animated-gradient">
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute top-1/3 left-16 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl float" />
        <div className="absolute bottom-1/3 right-16 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl float" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 narrow-container text-center">
          <Badge className="mb-6 bg-white/10 text-white border-white/20">
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            Çok Yakında
          </Badge>
          <h1 className="heading-xl text-white mb-6">
            <span className="gradient-text">Referanslarımız</span>
          </h1>
          <p className="body-lg text-slate-300 max-w-xl mx-auto">
            Birlikte çalıştığımız markaların başarı hikâyelerini, rakamları ve
            vaka analizlerini bu sayfada bir araya getiriyoruz.
          </p>
        </div>
      </section>

      {/* ── Coming Soon ── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="page-container">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/25 pulse-glow">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h2 className="heading-lg text-slate-900 mb-5">
              Bu Sayfa <span className="gradient-text">Hazırlanıyor</span>
            </h2>
            <p className="body-lg text-slate-500 leading-relaxed">
              Müşterilerimizle birlikte yürüttüğümüz projelerin detaylı başarı
              hikâyelerini, ölçülebilir sonuçlarını ve vaka analizlerini
              titizlikle hazırlıyoruz. Çok yakında burada olacak.
            </p>
          </div>

          {/* İlerleme adımları */}
          <div className="max-w-2xl mx-auto mb-20">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {steps.map((step) => (
                <div
                  key={step.title}
                  className={
                    step.done
                      ? "rounded-2xl p-5 border bg-blue-50 border-blue-200 flex flex-col items-center text-center gap-3"
                      : "rounded-2xl p-5 border bg-slate-50 border-slate-100 flex flex-col items-center text-center gap-3"
                  }
                >
                  <div className={
                    step.done
                      ? "w-10 h-10 rounded-xl flex items-center justify-center bg-blue-600 text-white"
                      : "w-10 h-10 rounded-xl flex items-center justify-center bg-slate-200 text-slate-400"
                  }>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className={
                    step.done
                      ? "text-sm font-semibold text-blue-700 leading-snug"
                      : "text-sm font-semibold text-slate-500 leading-snug"
                  }>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 shimmer-bar" />
            </div>
          </div>

          {/* Bulanık ön izleme */}
          <div className="section-header">
            <Badge className="mb-4">
              <Lock className="w-3 h-3 mr-1.5" />
              Ön İzleme
            </Badge>
            <h3 className="heading-md text-slate-900 mb-4">
              Yakında Açıklanacak <span className="gradient-text">Markalar</span>
            </h3>
            <p className="text-slate-500 max-w-lg mx-auto">
              Birlikte çalıştığımız bazı markalardan bir kesit — detaylı hikâyeleri
              çok yakında yayında.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 max-w-4xl mx-auto">
            {sneakPeek.map((ref) => (
              <div
                key={ref.name}
                className="relative bg-slate-50 border border-slate-100 rounded-2xl aspect-square flex items-center justify-center overflow-hidden group"
              >
                <Image
                  src={ref.logo}
                  alt=""
                  aria-hidden="true"
                  width={72}
                  height={72}
                  className="object-contain grayscale opacity-50 blur-[3px] scale-95 transition-transform duration-300 group-hover:scale-100"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-white/30">
                  <Lock className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Rakamlarla Ortisoft ── */}
      <section className="py-20 md:py-28 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="relative z-10 page-container">
          <div className="section-header">
            <Badge className="mb-4 bg-white/10 text-white border-white/20">
              <Award className="w-3.5 h-3.5 mr-1.5" />
              Rakamlarla Ortisoft
            </Badge>
            <h2 className="heading-lg text-white mb-5">
              Sayfa Hazırlanırken, <span className="gradient-text">Rakamlar Konuşsun</span>
            </h2>
            <p className="body-lg text-slate-400 max-w-xl mx-auto">
              Vaka analizlerini beklerken bugüne kadarki yolculuğumuzdan birkaç rakam.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col items-center text-center gap-3 hover:border-blue-500/40 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-600/15 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-3xl font-black gradient-text">{stat.number}</div>
                <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 md:py-28 animated-gradient relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 narrow-container text-center">
          <h2 className="heading-lg text-white mb-6">
            Siz de Bir Sonraki <span className="gradient-text">Başarı Hikâyemiz</span> Olun
          </h2>
          <p className="body-lg text-slate-300 mb-10 max-w-lg mx-auto">
            Referanslar sayfamız yayına girmeden önce projenizi konuşmak için
            bizimle iletişime geçebilirsiniz.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="gradient" size="xl" asChild>
              <Link href="/contact">
                <Mail className="w-5 h-5" />
                Bize Ulaşın
              </Link>
            </Button>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" size="xl" asChild>
              <Link href="/about#references">
                Şimdiden Birkaç Örneğe Bakın
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}