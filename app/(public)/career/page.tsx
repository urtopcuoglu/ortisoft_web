import Link from "next/link";
import type { Metadata } from "next";
import { MapPin, Briefcase, Building2, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listPublishedCareerPostings } from "@/modules/career/actions";

export const metadata: Metadata = {
  title: "Kariyer | Ortisoft",
  description: "Ortisoft'ta açık pozisyonları inceleyin, ekibimize katılın.",
};

export default async function CareerPage() {
  const postings = await listPublishedCareerPostings();

  return (
    <div className="flex flex-col">

      {/* ── Hero ── */}
      <section className="relative py-32 md:py-40 overflow-hidden animated-gradient">
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute top-1/3 left-16 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl float" />
        <div className="absolute bottom-1/3 right-16 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl float" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 narrow-container text-center">
          <Badge className="mb-6 bg-white/10 text-white border-white/20">Kariyer</Badge>
          <h1 className="heading-xl text-white mb-6">
            <span className="gradient-text">Ekibimize Katılın</span>
          </h1>
          <p className="body-lg text-slate-300 max-w-xl mx-auto">
            Yetenekli ve tutkulu insanlarla çalışıyor, herkese gelişim fırsatları sunuyoruz.
          </p>
        </div>
      </section>

      {/* ── Postings ── */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="page-container">
          {postings.length === 0 ? (
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white rounded-2xl p-10 border border-slate-100">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Building2 className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-3">Şu an aktif ilan bulunmuyor</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  Yeni pozisyonlar açıldığında burada duyurulacak. Şimdiden başvurunuzu iletebilir,
                  gelecekte değerlendirilebilmesi için dosyalarınızı bizimle paylaşabilirsiniz.
                </p>
                <Button variant="gradient" size="lg" asChild>
                  <Link href="/contact">Açık Başvuru Gönder</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto flex flex-col gap-6">
              {postings.map((posting) => {
                const requirements = Array.isArray(posting.requirements)
                  ? (posting.requirements as string[])
                  : [];
                const mailtoHref = `mailto:${posting.applyEmail}?subject=${encodeURIComponent(
                  `Başvuru: ${posting.title}`
                )}`;
                return (
                  <div
                    key={posting.id}
                    className="bg-white rounded-2xl p-8 border border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="font-bold text-slate-900 text-xl mb-2">{posting.title}</h3>
                        <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" /> {posting.location}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Briefcase className="w-4 h-4" /> {posting.employmentType}
                          </span>
                        </div>
                      </div>
                      <Button variant="gradient" asChild>
                        <a href={mailtoHref}>
                          Başvur <ArrowRight className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>

                    <p className="text-slate-600 text-sm leading-relaxed mb-5">
                      {posting.description}
                    </p>

                    {requirements.length > 0 && (
                      <ul className="space-y-2">
                        {requirements.map((req) => (
                          <li key={req} className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
                            <span className="text-slate-700 text-sm leading-relaxed">{req}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
