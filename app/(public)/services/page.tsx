import Link from "next/link";
import {
  Search, Lightbulb, Wrench, LineChart, ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { listServices } from "@/modules/services/actions";
import { resolveIcon } from "@/lib/icon-map";
import { resolveServiceTheme } from "@/lib/color-theme";
import { isPageComingSoon } from "@/modules/pages/actions";
import ComingSoonPage from "@/components/ComingSoonPage";

const processSteps = [
  { step: "01", icon: Search,    title: "Analiz",       desc: "İhtiyaçlarınızı, mevcut durumunuzu ve hedeflerinizi derinlemesine analiz ediyoruz. Paydaş görüşmeleri ve veri incelemesiyle gerçek problemi tanımlıyoruz." },
  { step: "02", icon: Lightbulb, title: "Strateji",     desc: "Analiz bulgularına dayalı özelleştirilmiş bir strateji ve yol haritası hazırlıyoruz. Öncelikleri netleştiriyor, beklentileri yönetiyoruz." },
  { step: "03", icon: Wrench,    title: "Uygulama",     desc: "Agile metodolojisiyle hızlı ve şeffaf bir şekilde uygulama yapıyoruz. Düzenli check-in'lerle sizi her adımda bilgilendiriyoruz." },
  { step: "04", icon: LineChart, title: "Optimizasyon", desc: "Sonuçları ölçüyor, öğreniyor ve sürekli iyileştiriyoruz. Uzun vadeli başarı için süreci izlemeye ve geliştirmeye devam ediyoruz." },
];

export default async function ServicesPage() {
  if (await isPageComingSoon("services")) {
    return <ComingSoonPage pageName="Hizmetlerimiz" />;
  }

  const services = await listServices();

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
            {services.map((service) => {
              const ServiceIcon = resolveIcon(service.icon);
              const colors = resolveServiceTheme(service.colorTheme);
              const features = Array.isArray(service.features)
                ? (service.features as string[])
                : [];
              return (
                <div
                  key={service.id}
                  id={service.slug}
                  className={cn(
                    "bg-white rounded-2xl p-7 border-2 transition-all duration-300 hover:shadow-xl flex flex-col",
                    colors.border,
                    colors.glow,
                  )}
                >
                  {/* Card Header */}
                  <div className="flex items-start gap-4 mb-5">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                      colors.iconBg,
                    )}>
                      <ServiceIcon className={cn("w-6 h-6", colors.iconText)} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-1">
                        {service.tag}
                      </span>
                      <Badge className={cn("text-xs", colors.badge)}>
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
                    {features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <CheckCircle2 className={cn("w-4 h-4 mt-0.5 flex-shrink-0", colors.check)} />
                        <span className="text-slate-700 text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
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