"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Zap, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/",         label: "Anasayfa" },
  { href: "/services", label: "Hizmetlerimiz" },
  { href: "/projects", label: "Projelerimiz" },
  { href: "/about",    label: "Hakkımızda" },
  { href: "/contact",  label: "İletişim" },
];

export default function Header() {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-sm",
          scrolled
            ? "bg-white/95 shadow-lg border-b border-slate-200/50"
            : "bg-gradient-to-b from-black/40 to-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-md shadow-blue-500/30 group-hover:shadow-blue-500/50 group-hover:scale-105 transition-all duration-300">
                <Zap size={18} className="text-white" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col leading-none">
                <span className={cn(
                  "font-extrabold text-[1.05rem] tracking-tight transition-colors duration-200",
                  scrolled ? "text-slate-900" : "text-white drop-shadow-lg"
                )}>
                  Orti<span className={scrolled ? "text-blue-600" : "text-blue-300"}>soft</span>
                </span>
                <span className={cn(
                  "text-[9px] font-bold tracking-[0.18em] uppercase mt-0.5 transition-colors duration-200",
                  scrolled ? "text-slate-600" : "text-white/70 drop-shadow"
                )}>
                  Digital Solutions
                </span>
              </div>
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden md:flex items-center gap-0.5">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200",
                      active
                        ? scrolled
                          ? "text-blue-700 bg-blue-50"
                          : "text-white bg-white/20"
                        : scrolled
                          ? "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                          : "text-white/95 hover:text-white hover:bg-white/15"
                    )}
                  >
                    {link.label}
                    {active && (
                      <span className={cn(
                        "absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full",
                        scrolled ? "bg-blue-600" : "bg-white"
                      )} />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* ── Desktop CTA ── */}
            <div className="hidden md:flex">
              <Link
                href="/contact"
                className={cn(
                  "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:-translate-y-0.5",
                  scrolled
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 hover:shadow-blue-500/35"
                    : "bg-white/15 text-white border border-white/30 hover:bg-white/25 backdrop-blur-sm"
                )}
              >
                Görüşme Talep Et
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* ── Mobile Toggle ── */}
            <button
              className={cn(
                "md:hidden flex items-center justify-center w-9 h-9 rounded-lg transition-colors duration-200",
                scrolled
                  ? "text-slate-700 hover:bg-slate-100"
                  : "text-white hover:bg-white/10"
              )}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menü"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

          </div>
        </div>

        {/* ── Mobile Menu ── */}
        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-300",
          mobileOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="bg-white border-t border-slate-100 px-4 py-4">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                      active
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <Link
                href="/contact"
                className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-bold"
              >
                Görüşme Talep Et
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
