"use client";

import { useState } from "react";
import {
  MapPin, Phone, Mail, Clock,
  ArrowRight, Send, ChevronDown, ChevronUp, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FormData {
  name: string; email: string; company: string; service: string; message: string;
}

const serviceOptions = [
  "Proje Danışmanlığı", "Yazılım Danışmanlığı",
  "Dijital Pazarlama Danışmanlığı", "Dijital Dönüşüm",
  "SaaS Ürün Demo", "Diğer",
];

const contactInfo = [
  { icon: MapPin, title: "Adres",           lines: ["Ankara, Türkiye"],           color: "text-blue-600",   bg: "bg-blue-50",   href: "https://maps.google.com/?q=Ankara+Turkiye" },
  { icon: Phone,  title: "Telefon",          lines: ["+90 (551) 714 24 52", "+90 (543) 841 06 40"],                           color: "text-violet-600", bg: "bg-violet-50", href: "tel:+905517142452" },
  { icon: Mail,   title: "E-posta",          lines: ["ortisofttech@gmail.com"],                                                color: "text-emerald-600",bg: "bg-emerald-50",href: "mailto:ortisofttech@gmail.com" },
];

const faqs = [
  { q: "İlk danışmanlık görüşmesi ücretli mi?",        a: "Hayır. İlk keşif görüşmesi tamamen ücretsizdir. 30-60 dakika süren bu görüşmede ihtiyaçlarınızı dinler, size özel bir yaklaşım öneririz. Herhangi bir taahhüt olmaksızın görüşmeyi sonlandırabilirsiniz." },
  { q: "Projemi ne kadar sürede teslim edersiniz?",    a: "Proje süresi kapsama göre değişmektedir. Keşif danışmanlığı 1-2 hafta, orta ölçekli yazılım projeleri 2-4 ay, dijital dönüşüm programları ise 6-12 ay sürebilmektedir. İlk görüşmeden sonra detaylı bir zaman çizelgesi paylaşırız." },
  { q: "Hangi sektörlere hizmet veriyorsunuz?",        a: "E-ticaret, fintech, sağlık teknolojisi, eğitim, perakende, üretim ve SaaS başta olmak üzere pek çok sektörde deneyimimiz bulunmaktadır. Sektörünüze özgü regülasyon ve dinamikleri bilen ekibimiz size en uygun çözümü tasarlar." },
  { q: "Uzaktan çalışma yapıyor musunuz?",             a: "Evet, tüm hizmetlerimizi tamamen uzaktan sunabiliyoruz. İstanbul ofisimizde yüz yüze toplantı tercihiniz varsa onu da organize edebiliyoruz. Video konferans, proje yönetim araçları ve düzenli raporlamalarla sizi her an bilgilendiriyoruz." },
  { q: "Proje sonrası destek veriyor musunuz?",        a: "Evet. Tüm projelerimizde proje teslimini takiben 30 günlük ücretsiz destek süresi yer almaktadır. Bunun ötesinde aylık veya yıllık bakım ve destek paketlerimiz bulunmaktadır." },
  { q: "Referans veya örnek çalışma görebilir miyim?", a: "Kesinlikle. Projeler sayfamızda portföyümüzü inceleyebilirsiniz. Gizlilik sözleşmesi çerçevesinde belirli müşteri projelerine ilişkin detaylı vaka analizleri de paylaşabiliyoruz." },
];

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({ name: "", email: "", company: "", service: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [openFaq,   setOpenFaq]   = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSubmitted(true);
  };

  const field = "w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-200";

  return (
    <div className="flex flex-col">

      {/* ── Hero ── */}
      <section className="relative py-32 md:py-40 overflow-hidden animated-gradient">
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute top-1/3 right-16 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl float" />
        <div className="absolute bottom-1/3 left-16 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl float" style={{ animationDelay: "1.5s" }} />

        <div className="relative z-10 narrow-container text-center">
          <Badge className="mb-6 bg-white/10 text-white border-white/20">Bize Ulaşın</Badge>
          <h1 className="heading-xl text-white mb-6">
            <span className="gradient-text">İletişim</span>
          </h1>
          <p className="body-lg text-slate-300 max-w-lg mx-auto">
            Bir projeniz mi var? Sorunuz mu var? Hemen iletişime geçin —
            genellikle 24 saat içinde yanıt veriyoruz.
          </p>
        </div>
      </section>

      {/* ── Form + Info ── */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 xl:gap-14">

            {/* Form – 3/5 */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl p-8 md:p-10 border border-slate-100 shadow-sm">
                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-5">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Mesajınız Alındı!</h3>
                    <p className="text-slate-500 text-sm mb-8">En geç 24 saat içinde size geri döneceğiz. Teşekkür ederiz.</p>
                    <Button variant="outline" onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", company: "", service: "", message: "" }); }}>
                      Yeni Mesaj Gönder
                    </Button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1.5">Mesaj Gönderin</h2>
                    <p className="text-slate-500 text-sm mb-8">Formu doldurun, en kısa sürede size dönelim.</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Ad Soyad <span className="text-red-500">*</span>
                          </label>
                          <input type="text" name="name" required placeholder="Adınız Soyadınız"
                            value={formData.name} onChange={handleChange} className={field} />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            E-posta <span className="text-red-500">*</span>
                          </label>
                          <input type="email" name="email" required placeholder="ornek@sirket.com"
                            value={formData.email} onChange={handleChange} className={field} />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Şirket / Kurum</label>
                        <input type="text" name="company" placeholder="Şirket adınız"
                          value={formData.company} onChange={handleChange} className={field} />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">İlgilendiğiniz Hizmet</label>
                        <select name="service" value={formData.service} onChange={handleChange}
                          className={cn(field, "cursor-pointer")}>
                          <option value="">Hizmet seçin (isteğe bağlı)</option>
                          {serviceOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Mesajınız <span className="text-red-500">*</span>
                        </label>
                        <textarea name="message" required rows={5} placeholder="Projenizi veya ihtiyacınızı kısaca anlatın..."
                          value={formData.message} onChange={handleChange}
                          className={cn(field, "resize-none")} />
                      </div>

                      <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={loading}>
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Gönderiliyor...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Send className="w-4 h-4" />
                            Mesaj Gönder
                          </span>
                        )}
                      </Button>

                      <p className="text-xs text-slate-400 text-center">
                        Kişisel verileriniz KVKK kapsamında korunmaktadır.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>

            {/* Info – 2/5 */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="mb-2">
                <h2 className="text-2xl font-bold text-slate-900 mb-1.5">Bize Ulaşın</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Telefon, e-posta veya ofisimize gelerek de iletişime geçebilirsiniz.
                </p>
              </div>

              {contactInfo.map((info, i) => (
                <a
                  key={i}
                  href={info.href}
                  target={info.href.startsWith("http") ? "_blank" : undefined}
                  rel={info.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="bg-white rounded-xl px-5 py-4 border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 flex items-start gap-4 group"
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", info.bg)}>
                    <info.icon className={cn("w-4 h-4", info.color)} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">{info.title}</p>
                    {info.lines.map((line) => (
                      <p key={line} className="text-slate-700 text-sm font-medium leading-snug group-hover:text-blue-600 transition-colors duration-200">{line}</p>
                    ))}
                  </div>
                </a>
              ))}

              {/* Map placeholder */}
              <div className="bg-slate-100 rounded-xl overflow-hidden h-44 relative border border-slate-200">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <MapPin className="w-7 h-7 text-blue-500" />
                  <p className="text-sm font-semibold text-slate-700">Ankara, Türkiye</p>
                  <a
                    href="https://maps.google.com/?q=Ankara+Turkiye"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    Google Maps&apos;te Aç <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="page-container">
          <div className="section-header">
            <Badge className="mb-4">SSS</Badge>
            <h2 className="heading-lg text-slate-900 mb-5">Sıkça Sorulan Sorular</h2>
            <p className="body-lg text-slate-500 max-w-xl mx-auto">
              Aklınızdaki soruların yanıtları burada olmayabilir — her zaman doğrudan iletişime geçebilirsiniz.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className={cn(
                "rounded-xl overflow-hidden border transition-all duration-200",
                openFaq === i ? "border-blue-200 shadow-sm" : "border-slate-200 hover:border-slate-300"
              )}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4.5 text-left bg-white hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold text-slate-900 text-sm pr-6">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    : <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  }
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 bg-white border-t border-slate-100">
                    <p className="text-slate-600 text-sm leading-relaxed pt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}