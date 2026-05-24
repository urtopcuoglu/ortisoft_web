import Link from "next/link";
import {
  Target, Eye, Heart, Zap, Shield, Users,
  TrendingUp, Star, Linkedin, ExternalLink,
  CheckCircle2, Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const teamMembers = [
  {
    name: "Umutcan Recep TOPCUOĞLU",
    role: "Kurucu Ortak | Yazılım Geliştiricisi",
    bio: "Detaylar yakında eklenecek.",
    initials: "UT",
    color: "from-blue-500 to-blue-600",
    linkedin: "#",
    specialties: ["Yazılım Geliştirme", "Teknik Mimari", "Proje Danışmanlığı"],
  },
  {
    name: "Ezgi TOSUN",
    role: "Kurucu Ortak | Proje Yöneticisi",
    bio: "Detaylar yakında eklenecek.",
    initials: "ET",
    color: "from-violet-500 to-violet-600",
    linkedin: "#",
    specialties: ["Proje Yönetimi", "Müşteri İlişkileri", "Operasyon"],
  },
  {
    name: "Özlem Güneş AVCI",
    role: "Dijital Pazarlama ve Marka Yöneticisi",
    bio: "Detaylar yakında eklenecek.",
    initials: "ÖA",
    color: "from-emerald-500 to-emerald-600",
    linkedin: "#",
    specialties: ["Dijital Pazarlama", "Marka Yönetimi", "İçerik Stratejisi"],
  },
];

const references = [
  {
    name: "Kasırga Bilgisayar",
    description: "Bilgisayar donanım ve yazılım çözümleri",
    logo: null,
    url: "#",
  },
  {
    name: "Railmentor",
    description: "Eğitim ve kariyer koçluğu platformu",
    logo: null,
    url: "#",
  },
  {
    name: "Eatwellz Beslenme Danışmanlığı",
    description: "Kişisel beslenme ve sağlık danışmanlığı",
    logo: null,
    url: "#",
  },
  {
    name: "Green Eco Map",
    description: "Sürdürülebilir yaşam ve çevre platformu",
    logo: null,
    url: "#",
  },
];

const partners = [
  { name: "İkas", logo: null },
  { name: "Ticimax", logo: null },
  { name: "Meta", logo: null },
  { name: "Google", logo: null },
  { name: "WordPress", logo: null },
  { name: "Yandex", logo: null },
  { name: "Shopier", logo: null },
  { name: "Shopify", logo: null },
  { name: "Claude", logo: null },
];

const values = [
  { icon: Heart,      title: "Müşteri Odaklılık",  desc: "Her kararımızda müşterimizin başarısını ön planda tutarız. Uzun vadeli ilişki kurar, gerçek değer yaratmaya odaklanırız." },
  { icon: Zap,        title: "Hız ve Çeviklik",    desc: "Değişen ihtiyaçlara hızlı adapte olur, iteratif yaklaşımla somut sonuçlar üretiriz. Agile ruhunu her işimize yansıtırız." },
  { icon: Shield,     title: "Güvenilirlik",        desc: "Verdiğimiz sözleri tutarız. Şeffaf iletişim, zamanında teslimat ve dürüstlük Ortisoft kültürünün temelidir." },
  { icon: TrendingUp, title: "Sürekli Gelişim",    desc: "Teknoloji durmadan değişiyor; biz de durmadan öğreniyoruz. Ekibimizin gelişimine sürekli yatırım yapıyoruz." },
  { icon: Users,      title: "Ekip Ruhu",           desc: "Bireysel başarılardan değil, kolektif başarıdan güç alıyoruz. Müşterilerimizi de bu ekibin bir parçası görüyoruz." },
  { icon: Star,       title: "Mükemmellik",         desc: "Ortalamaya razı olmuyoruz. Her projede en iyi sonucu üretmek için ekstra çaba göstermek DNA'mızda var." },
];

const milestones = [
  { year: "2019", title: "Ortisoft Kuruldu",         desc: "İstanbul'da 2 kişilik ekip olarak proje danışmanlığı hizmetleriyle başladık." },
  { year: "2020", title: "İlk 20 Müşteri",           desc: "Pandemi döneminde işletmelerin dijitalleşmesine destek vererek müşteri tabanımızı büyüttük." },
  { year: "2021", title: "Yazılım Danışmanlığı",     desc: "Yazılım danışmanlığı servisini ekleyerek teknik ekibimizi güçlendirdik. 10 kişiye ulaştık." },
  { year: "2022", title: "İlk SaaS Ürün",            desc: "FlowDesk ve TurkNLP Toolkit ile kendi ürün yolculuğumuza başladık." },
  { year: "2023", title: "60+ Müşteri & 3 Yeni Ürün", desc: "OrtiBOT, HesapPro ve CampusConnect piyasaya çıktı. Ekibimiz 20 kişiye ulaştı." },
  { year: "2024", title: "120+ Proje Tamamlandı",    desc: "Dijital Pazarlama servisini ekledik. 85+ aktif müşteri ve 25 kişilik uzman ekiple büyümeye devam ediyoruz." },
  { year: "2025", title: "Yeni Hedefler",            desc: "Uluslararası pazara açılım ve kurumsal müşteri segmentine odaklanma stratejimizi hayata geçiriyoruz." },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col">

      {/* ── Hero ── */}
      <section className="relative py-32 md:py-40 overflow-hidden animated-gradient">
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute top-1/3 left-16 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl float" />
        <div className="absolute bottom-1/3 right-16 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl float" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 narrow-container text-center">
          <Badge className="mb-6 bg-white/10 text-white border-white/20">Biz Kimiz?</Badge>
          <h1 className="heading-xl text-white mb-6">
            <span className="gradient-text">Hakkımızda</span>
          </h1>
          <p className="body-lg text-slate-300 max-w-xl mx-auto">
            İşletmelerin dijital dönüşüm yolculuklarında güvenilir ortakları oluyoruz.
          </p>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="page-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-10 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Misyonumuz</h2>
              <p className="text-blue-100 leading-relaxed">
                Her ölçekteki işletmenin dijital potansiyelini tam anlamıyla ortaya çıkarmasına
                yardımcı olmak. Teknoloji ve stratejiyi bir araya getirerek ölçülebilir,
                sürdürülebilir büyüme yaratmak.
              </p>
            </div>
            <div className="bg-gradient-to-br from-violet-600 to-violet-800 rounded-2xl p-10 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Vizyonumuz</h2>
              <p className="text-violet-100 leading-relaxed">
                Türkiye&apos;nin en güvenilir dijital dönüşüm şirketi olmak ve yerel işletmeleri
                küresel rekabete hazırlamak. İnovasyon ve insan merkezli teknoloji anlayışıyla
                sektörde standartları belirleyen bir marka haline gelmek.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="page-container">
          <div className="section-header">

            <h2 className="heading-lg text-slate-900 mb-5">Ekibimiz</h2>
            <p className="body-lg text-slate-500 max-w-xl mx-auto">
              Farklı disiplinlerden gelen uzmanlarımız, ortak bir hedef için bir araya geldi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="bg-white rounded-2xl p-7 border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group"
              >
                <div className={cn(
                  "w-20 h-20 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xl font-bold mb-5 shadow-lg group-hover:scale-105 transition-transform duration-300",
                  member.color
                )}>
                  {member.initials}
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">{member.name}</h3>
                <p className="text-blue-600 text-xs font-semibold mb-4 uppercase tracking-wide">{member.role}</p>
                <p className="text-slate-500 text-xs leading-relaxed mb-5">{member.bio}</p>

                <div className="flex flex-wrap gap-1.5 justify-center mb-5">
                  {member.specialties.map((s) => (
                    <span key={s} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="flex gap-3 mt-auto">
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
                    className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all duration-200">
                    <Linkedin className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="page-container">
          <div className="section-header">
            <Badge className="mb-4">Değerlerimiz</Badge>
            <h2 className="heading-lg text-slate-900 mb-5">
              Bizi Biz Yapan <span className="gradient-text">Değerler</span>
            </h2>
            <p className="body-lg text-slate-500 max-w-xl mx-auto">
              Her kararımızda ve her projemizde bu değerleri rehber ediniyoruz.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, i) => (
              <div
                key={value.title}
                className={cn(
                  "rounded-2xl p-7 border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group",
                  i === 0 || i === 3
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-slate-50 border-slate-100 hover:border-blue-100"
                )}
              >
                <div className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-all duration-300",
                  i === 0 || i === 3 ? "bg-white/20" : "bg-blue-100 group-hover:bg-blue-600"
                )}>
                  <value.icon className={cn(
                    "w-5 h-5 transition-colors duration-300",
                    i === 0 || i === 3 ? "text-white" : "text-blue-600 group-hover:text-white"
                  )} />
                </div>
                <h3 className={cn("font-bold text-lg mb-2.5", i === 0 || i === 3 ? "text-white" : "text-slate-900")}>
                  {value.title}
                </h3>
                <p className={cn("text-sm leading-relaxed", i === 0 || i === 3 ? "text-blue-100" : "text-slate-500")}>
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── References ── */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="page-container">
          <div className="section-header">
            <Badge className="mb-4">Referanslarımız</Badge>
            <h2 className="heading-lg text-slate-900 mb-5">
              Birlikte Çalıştığımız <span className="gradient-text">Markalar</span>
            </h2>
            <p className="body-lg text-slate-500 max-w-xl mx-auto">
              Farklı sektörlerden müşterilerimizle başarı hikâyeleri yaratıyoruz.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {references.map((ref) => (
              <a
                key={ref.name}
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-2xl p-7 border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group"
              >
                <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-5 group-hover:bg-blue-50 transition-colors duration-300">
                  {ref.logo ? (
                    <img src={ref.logo} alt={ref.name} className="w-14 h-14 object-contain" />
                  ) : (
                    <Building2 className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors duration-300" />
                  )}
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-2 group-hover:text-blue-600 transition-colors duration-300">
                  {ref.name}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-4">{ref.description}</p>
                <span className="text-blue-600 text-xs font-semibold flex items-center gap-1 mt-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Siteyi Ziyaret Et <ExternalLink className="w-3 h-3" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Solution Partners ── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="page-container">
          <div className="section-header">
            <Badge className="mb-4">Ekosistem</Badge>
            <h2 className="heading-lg text-slate-900 mb-5">
              Çözüm <span className="gradient-text">Ortaklarımız</span>
            </h2>
            <p className="body-lg text-slate-500 max-w-xl mx-auto">
              Güçlü iş ortaklıklarıyla müşterilerimize en iyi teknoloji ve platform deneyimini sunuyoruz.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 flex flex-col items-center justify-center gap-3 hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 w-36 h-28 group"
              >
                {partner.logo ? (
                  <img src={partner.logo} alt={partner.name} className="w-12 h-12 object-contain" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:border-blue-200 transition-colors duration-300">
                    <Building2 className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors duration-300" />
                  </div>
                )}
                <span className="text-slate-700 text-xs font-semibold text-center leading-tight">
                  {partner.name}
                </span>
              </div>
            ))}
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl px-6 py-5 flex flex-col items-center justify-center gap-3 w-36 h-28 text-slate-400">
              <span className="text-2xl font-light">+</span>
              <span className="text-xs text-center leading-tight">Ve daha fazlası</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="py-20 md:py-28 bg-slate-900">
        <div className="page-container">
          <div className="section-header">
            <Badge className="mb-5 bg-white/10 text-white border-white/20">Yolculuğumuz</Badge>
            <h2 className="heading-lg text-white mb-5">Kilometre Taşlarımız</h2>
            <p className="body-lg text-slate-400 max-w-xl mx-auto">
              Küçük bir ekipten büyüyen bir şirkete — kilometre taşlarımız.
            </p>
          </div>

          <div className="max-w-3xl mx-auto relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-600 via-violet-600 to-blue-600" />
            <div className="space-y-5">
              {milestones.map((m) => (
                <div key={m.year} className="flex gap-8 pl-14 relative">
                  <div className="absolute left-2.5 top-3 w-5 h-5 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 border-2 border-slate-900 flex items-center justify-center">
                    <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                  </div>
                  <div className="bg-slate-800 rounded-xl px-6 py-5 border border-slate-700 hover:border-blue-500/50 transition-all duration-300 flex-1">
                    <span className="text-blue-400 text-xs font-bold uppercase tracking-wider">{m.year}</span>
                    <h3 className="text-white font-bold text-base mt-1 mb-1.5">{m.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Careers ── */}
      <section id="career" className="py-20 md:py-28 bg-slate-50">
        <div className="page-container">
          <div className="section-header">
            <Badge className="mb-4">Kariyer</Badge>
            <h2 className="heading-lg text-slate-900 mb-5">Ekibimize Katılın</h2>
            <p className="body-lg text-slate-500 max-w-xl mx-auto">
              Yetenekli ve tutkulu insanlarla çalışıyor, herkese gelişim fırsatları sunuyoruz.
            </p>
          </div>

          <div className="max-w-2xl mx-auto text-center mb-12">
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
                <Link href="/contact">
                  Açık Başvuru Gönder
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}