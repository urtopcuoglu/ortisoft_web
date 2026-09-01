import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Phone, Mail, MapPin, Globe, User, Calendar } from "lucide-react";
import { getGuideContactDetail } from "@/modules/crm/actions";
import { listGuideCategories, listGuideUsers } from "@/modules/guide/actions";
import { GUIDE_RELATION_TYPE_LABEL } from "@/modules/guide/schema";
import { formatGunAyYil } from "@/lib/utils";
import EditContactButton from "@/components/admin/crm/EditContactButton";
import ClientDetailTabs from "@/components/admin/crm/ClientDetailTabs";

export const metadata: Metadata = {
  title: "Firma Detayı | Ortisoft CRM",
  robots: { index: false, follow: false },
};

export default async function CrmContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [contact, categories, users] = await Promise.all([
    getGuideContactDetail(id),
    listGuideCategories(),
    listGuideUsers(),
  ]);

  if (!contact) notFound();

  const infoItems = [
    { icon: User, label: "Yetkili", value: contact.authorizedPerson },
    { icon: Phone, label: "Telefon", value: contact.phone },
    { icon: Mail, label: "E-posta", value: contact.email },
    { icon: MapPin, label: "Adres", value: contact.address || "—" },
    { icon: Globe, label: "Web Sitesi", value: contact.website || "—" },
    { icon: User, label: "İlgili Kişi", value: contact.relatedUser?.name ?? "—" },
    { icon: Calendar, label: "Kayıt Tarihi", value: formatGunAyYil(contact.recordDate) },
    ...(contact.becameActiveAt
      ? [{ icon: Calendar, label: "Aktif Müşteri Olma Tarihi", value: formatGunAyYil(contact.becameActiveAt) }]
      : []),
  ];

  return (
    <div>
      <Link
        href="/admin/crm"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ChevronLeft className="h-4 w-4" /> CRM&apos;e dön
      </Link>

      <div className="mb-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">{contact.companyName}</h1>
            <div className="mt-1.5 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                {contact.category.name}
              </span>
              <span className="rounded-full bg-blue-100 dark:bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-400">
                {GUIDE_RELATION_TYPE_LABEL[contact.relationType]}
              </span>
            </div>
          </div>
          <EditContactButton contact={contact} categories={categories} users={users} />
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          {infoItems.map((item) => (
            <div key={item.label}>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500">
                <item.icon className="h-3 w-3" /> {item.label}
              </div>
              <div className="mt-0.5 text-sm text-slate-700 dark:text-slate-200">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <ClientDetailTabs
        contactId={contact.id}
        meetings={contact.meetings}
        proposals={contact.proposals}
        agreements={contact.agreements}
        payments={contact.payments}
      />
    </div>
  );
}
