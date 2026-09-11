"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Building2, ArrowRight } from "lucide-react";
import PortfolioCustomerModal from "@/components/admin/portfolio/PortfolioCustomerModal";
import GuideContactModal from "@/components/admin/GuideContactModal";

/**
 * Mesaj detay sayfasındaki iki "ekle" aksiyonu — bilinçli olarak İKİ AYRI
 * sisteme yazar (bkz. prisma/schema.prisma Pazarlama Portföy Yönetimi dosya
 * başı notu): Müşteri Yönetimi portföyü (her zaman gösterilir) ve Firmalar
 * (sadece msg.company doluysa — mesajı yazan bir firma temsilcisiyse).
 * İkisi de tek yönlü: bir kez eklenince buton "zaten eklendi → görüntüle"
 * linkine döner, tekrar eklenemez (bkz. ContactMessage.portfolioCustomerId/
 * guideContactId).
 */
export default function MessageCrmActions({
  message,
  services,
  categories,
  users,
}: {
  message: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
    message: string;
    portfolioCustomer: { id: string; companyName: string } | null;
    guideContact: { id: string; companyName: string } | null;
  };
  services: { id: string; title: string }[];
  categories: { id: string; name: string }[];
  users: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {message.portfolioCustomer ? (
        <Link
          href={`/admin/crm/portfolio/${message.portfolioCustomer.id}`}
          className="flex items-center gap-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
        >
          Portföyde: {message.portfolioCustomer.companyName} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => setPortfolioOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
        >
          <UserPlus className="h-3.5 w-3.5" /> Potansiyel Müşteriye Ekle
        </button>
      )}

      {message.company &&
        (message.guideContact ? (
          <Link
            href={`/admin/crm/${message.guideContact.id}`}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
          >
            Firmalarda: {message.guideContact.companyName} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setGuideOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
          >
            <Building2 className="h-3.5 w-3.5" /> Firmalara Ekle
          </button>
        ))}

      <PortfolioCustomerModal
        open={portfolioOpen}
        onOpenChange={setPortfolioOpen}
        services={services}
        prefill={{
          companyName: message.company ?? "",
          authorizedPerson: message.name,
          contactEmail: message.email,
          contactPhone: message.phone ?? "",
          description: message.message,
        }}
        sourceMessageId={message.id}
        onSaved={() => router.refresh()}
      />

      {message.company && (
        <GuideContactModal
          open={guideOpen}
          onOpenChange={setGuideOpen}
          categories={categories}
          users={users}
          prefill={{
            companyName: message.company,
            authorizedPerson: message.name,
            phone: message.phone ?? "",
            email: message.email,
          }}
          sourceMessageId={message.id}
          onSaved={() => router.refresh()}
        />
      )}
    </div>
  );
}
