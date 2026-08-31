import React from "react";
import Link from "next/link";
import {
  Zap, Mail, Phone, MapPin,
  Linkedin, Twitter, Github, ArrowUpRight, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { listContracts } from "@/modules/contracts/actions";
import { getSiteSettings } from "@/modules/settings/actions";
import { getT } from "@/lib/i18n/server";

const footerLinks = {
  services: [
    { labelKey: "footer.serviceConsulting", href: "/services#project" },
    { labelKey: "footer.serviceSoftware",   href: "/services#software" },
    { labelKey: "footer.serviceMarketing",  href: "/services#marketing" },
    { labelKey: "footer.serviceDigital",    href: "/services#digital" },
  ],
  company: [
    { labelKey: "nav.about",       href: "/about" },
    { labelKey: "nav.references",  href: "/references", child: true },
    { labelKey: "nav.products",    href: "/products" },
    { labelKey: "nav.projects",    href: "/projects" },
    { labelKey: "nav.career",      href: "/career" },
    { labelKey: "nav.blog",        href: "/blog" },
    { labelKey: "nav.contact",     href: "/contact" },
  ],
};

// Sabit (fallback) değerler — /admin/site-settings henüz hiç kaydedilmemişse
// (SiteSettings tablosu boşsa) footer bunlara düşer, asla boş/kırık görünmez.
const DEFAULT_CONTACT_EMAIL = "ortisofttech@gmail.com";
const DEFAULT_CONTACT_PHONE1 = "+90 551 714 24 52";
const DEFAULT_CONTACT_PHONE2 = "+90 543 841 06 40";
const DEFAULT_ADDRESS = "Ankara, Türkiye";
const DEFAULT_ADDRESS_MAP_URL = "https://maps.google.com/?q=Ankara+Turkiye";

export default async function Footer() {
  const [contracts, t, settings] = await Promise.all([listContracts(), getT(), getSiteSettings()]);

  const socials = [
    { icon: Linkedin, href: settings?.linkedinUrl || "#", label: "LinkedIn" },
    { icon: Twitter,  href: settings?.twitterUrl || "#",  label: "Twitter"  },
    { icon: Github,   href: settings?.githubUrl || "#",   label: "GitHub"   },
  ];

  const contactItems = [
    { icon: Mail,   label: settings?.contactEmail || DEFAULT_CONTACT_EMAIL, href: `mailto:${settings?.contactEmail || DEFAULT_CONTACT_EMAIL}` },
    { icon: Phone,  label: settings?.contactPhone1 || DEFAULT_CONTACT_PHONE1, href: `tel:${(settings?.contactPhone1 || DEFAULT_CONTACT_PHONE1).replace(/\s+/g, "")}` },
    ...(settings?.contactPhone2 || DEFAULT_CONTACT_PHONE2
      ? [{ icon: Phone, label: settings?.contactPhone2 || DEFAULT_CONTACT_PHONE2, href: `tel:${(settings?.contactPhone2 || DEFAULT_CONTACT_PHONE2).replace(/\s+/g, "")}` }]
      : []),
    { icon: MapPin, label: settings?.address || DEFAULT_ADDRESS, href: settings?.addressMapUrl || DEFAULT_ADDRESS_MAP_URL },
  ];

  return (
    <footer className="bg-slate-950 text-white">

      {/* ── CTA Band ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-violet-700">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="text-center lg:text-left">
              <h3 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-3">
                {t("footer.ctaTitle")}
              </h3>
              <p className="text-blue-100 text-base font-light max-w-md leading-relaxed">
                {t("footer.ctaSubtitle")}
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2.5 bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl whitespace-nowrap text-base"
            >
              {t("footer.ctaButton")}
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main Footer ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-14 lg:gap-12">

          {/* Brand col – 4 of 12 */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                <Zap size={20} className="text-white" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-extrabold text-lg text-white">
                  Orti<span className="text-blue-400">soft</span>
                </span>
                <span className="text-[9px] font-bold text-slate-500 tracking-[0.18em] uppercase mt-0.5">
                  Digital Solutions
                </span>
              </div>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed font-light mb-8 max-w-xs">
              {t("footer.tagline")}
            </p>

            <div className="flex gap-2.5">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all duration-300 hover:scale-110"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Services col – 2 of 12 */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-sm text-white mb-7 tracking-wide">{t("footer.servicesTitle")}</h4>
            <ul className="space-y-4">
              {footerLinks.services.map((link) => (
                <li key={link.labelKey}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-blue-400 transition-colors duration-200 font-medium flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-blue-400 transition-colors duration-200 flex-shrink-0" />
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company col – 2 of 12 */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-sm text-white mb-7 tracking-wide">{t("footer.companyTitle")}</h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.labelKey} className={link.child ? "pl-4" : undefined}>
                  <Link
                    href={link.href}
                    className={cn(
                      "text-slate-400 hover:text-blue-400 transition-colors duration-200 font-medium flex items-center gap-2 group",
                      link.child ? "text-xs" : "text-sm"
                    )}
                  >
                    <span className={cn(
                      "rounded-full bg-slate-700 group-hover:bg-blue-400 transition-colors duration-200 flex-shrink-0",
                      link.child ? "w-1 h-1" : "w-1.5 h-1.5"
                    )} />
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact col – 4 of 12 */}
          <div className="lg:col-span-4">
            <h4 className="font-bold text-sm text-white mb-7 tracking-wide">{t("footer.contactTitle")}</h4>
            <div className="space-y-3.5">
              {contactItems.map(({ icon: Icon, label, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                >
                  <div className="w-8 h-8 bg-blue-600/15 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-blue-400" />
                  </div>
                  <span className="text-slate-300 text-xs font-medium group-hover:text-blue-400 transition-colors duration-200 leading-snug">
                    {label}
                  </span>
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* ── Bottom Bar ── */}
        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-xs font-light">
            © {new Date().getFullYear()} Ortisoft. {t("footer.rightsReserved")}
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
            {contracts.map((contract) => (
              <Link
                key={contract.slug}
                href={`/contracts/${contract.slug}`}
                className="text-xs text-slate-500 hover:text-blue-400 transition-colors duration-200 font-light"
              >
                {contract.title}
              </Link>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
}
