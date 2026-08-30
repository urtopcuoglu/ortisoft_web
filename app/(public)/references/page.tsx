import Link from "next/link";
import Image from "next/image";
import {
  TrendingUp, Users, Award, ArrowRight, Building2, Mail, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listReferences } from "@/modules/references/actions";

export const metadata = {
  title: "Referanslarımız | Ortisoft",
  description: "Birlikte çalıştığımız markalar ve başarı hikâyelerimiz.",
};

const stats = [
  { icon: Users,      number: "85+",  label: "Mutlu Müşteri" },
  { icon: Building2,  number: "120+", label: "Tamamlanan Proje" },
  { icon: TrendingUp, number: "6+",   label: "Yıllık Deneyim" },
];

export default async function ReferencesPage() {
  const references = await listReferences();

  return (
    <div className="flex flex-col">

      {/* ── Hero ── */}
      <section className="relative py-32 md:py-40 overflow-hidden animated-gradient">
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute top-1/3 left-16 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl float" />
        <div className="absolute bottom-1/3 right-16 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl float" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 narrow-container text-center">
          <Badge className="mb-6 bg-white/10 text-white border-white/20">Referanslarımız</Badge>
          <h1 className="heading-xl text-white mb-6">
            <span className="gradient-text">Birlikte Çalıştığımız Markalar</span>
          </h1>
          <p className="body-lg text-slate-300 max-w-xl mx-auto">
            Farklı sektörlerden müşterilerimizle başarı hikâyeleri yaratıyoruz.
          </p>
        </div>
      </section>

      {/* ── Reference Grid ── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="page-container">
          {references.length === 0 ? (
            <div className="max-w-xl mx-auto text-center text-slate-500">
              Henüz referans eklenmedi.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {references.map((ref) => {
                const CardTag = ref.projectLink ? "a" : "div";
                return (
                  <CardTag
                    key={ref.id}
                    {...(ref.projectLink
                      ? { href: ref.projectLink, target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="bg-white rounded-2xl p-8 border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group"
                  >
                    <div className="w-32 h-32 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-blue-50 transition-colors duration-300">
                      {ref.logoUrl ? (
                        <Image src={ref.logoUrl} alt={ref.clientName} width={100} height={100} className="object-contain" />
                      ) : (
                        <Building2 className="w-10 h-10 text-slate-400 group-hover:text-blue-500 transition-colors duration-300" />
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mb-2 group-hover:text-blue-600 transition-colors duration-300">
                      {ref.clientName}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-4">{ref.description}</p>
                    {ref.projectLink && (
                      <span className="text-blue-600 text-xs font-semibold flex items-center gap-1 mt-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Siteyi Ziyaret Et <ExternalLink className="w-3 h-3" />
                      </span>
                    )}
                  </CardTag>
                );
              })}
            </div>
          )}
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
              Sayılarla <span className="gradient-text">Başarımız</span>
            </h2>
            <p className="body-lg text-slate-400 max-w-xl mx-auto">
              Bugüne kadarki yolculuğumuzdan birkaç rakam.
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
            Projenizi konuşmak için bizimle iletişime geçebilirsiniz.
          </p>
          <Button variant="gradient" size="xl" asChild>
            <Link href="/contact">
              <Mail className="w-5 h-5" />
              Bize Ulaşın
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

    </div>
  );
}
