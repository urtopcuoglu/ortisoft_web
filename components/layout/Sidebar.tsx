"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Info, Phone, FolderKanban, Settings2, MessageSquare, Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/components/LocaleProvider";

interface SidebarLink {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  children?: { href: string; labelKey: string }[];
}

const sidebarLinks: SidebarLink[] = [
  { href: "/",         labelKey: "nav.home",     icon: Home },
  { href: "/services", labelKey: "nav.services", icon: Settings2 },
  { href: "/products", labelKey: "nav.products", icon: Package },
  { href: "/projects", labelKey: "nav.projects", icon: FolderKanban },
  {
    href: "/about", labelKey: "nav.about", icon: Info,
    children: [
      { href: "/references", labelKey: "nav.references" },
      { href: "/career",     labelKey: "nav.career" },
    ],
  },
  { href: "/contact",  labelKey: "nav.contact", icon: Phone },
];

export default function Sidebar() {
  const { t } = useTranslations();
  const [hovered, setHovered] = useState<string | null>(null);
  const pathname = usePathname();

  return (
    <aside className="hidden xl:flex flex-col fixed right-6 top-1/2 -translate-y-1/2 z-40">
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/60 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-black/40 p-2.5 flex flex-col gap-1.5">

        {sidebarLinks.map(({ href, labelKey, icon: Icon, children }) => {
          const isActive = pathname === href
            || (children?.some((c) => pathname === c.href) ?? false);
          return (
            <div
              key={href}
              className="relative"
              onMouseEnter={() => setHovered(href)}
              onMouseLeave={() => setHovered(null)}
            >
              <Link
                href={href}
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/35"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                )}
              >
                <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
              </Link>

              {hovered === href && !children && (
                <div className="absolute right-full mr-3.5 top-1/2 -translate-y-1/2 bg-slate-900/95 backdrop-blur-md text-white text-xs font-bold px-4 py-2.5 rounded-lg whitespace-nowrap pointer-events-none shadow-2xl z-50 border border-slate-700/50">
                  {t(labelKey)}
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[5px] border-4 border-transparent border-l-slate-900" />
                </div>
              )}

              {hovered === href && children && (
                <div className="absolute right-full mr-3.5 top-1/2 -translate-y-1/2 bg-slate-900/95 backdrop-blur-md rounded-lg whitespace-nowrap shadow-2xl z-50 border border-slate-700/50 overflow-hidden py-1 min-w-[150px]">
                  {children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        "block px-4 py-2 text-xs font-bold transition-colors duration-150",
                        pathname === child.href
                          ? "text-blue-400"
                          : "text-white hover:bg-white/10"
                      )}
                    >
                      {t(child.labelKey)}
                    </Link>
                  ))}
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[5px] border-4 border-transparent border-l-slate-900" />
                </div>
              )}
            </div>
          );
        })}

        <div className="w-5 h-px bg-slate-200 dark:bg-slate-700 mx-auto my-1" />

        {/* CTA */}
        <div
          className="relative"
          onMouseEnter={() => setHovered("cta")}
          onMouseLeave={() => setHovered(null)}
        >
          <Link
            href="/contact"
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-md shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-110 transition-all duration-200"
          >
            <MessageSquare size={15} />
          </Link>

          {hovered === "cta" && (
            <div className="absolute right-full mr-3.5 top-1/2 -translate-y-1/2 bg-slate-900/95 backdrop-blur-md text-white text-xs font-bold px-4 py-2.5 rounded-lg whitespace-nowrap pointer-events-none shadow-2xl z-50 border border-slate-700/50">
              {t("common.contactUs")}
              <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[5px] border-4 border-transparent border-l-slate-900" />
            </div>
          )}
        </div>

      </div>
    </aside>
  );
}
