import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, User, Mail, Phone, MapPin, Briefcase, Calendar, Download } from "lucide-react";
import { getPortfolioCustomer } from "@/modules/portfolio/actions";
import { listServices } from "@/modules/services/actions";
import { formatGunAyYil } from "@/lib/utils";
import EditPortfolioCustomerButton from "@/components/admin/portfolio/EditPortfolioCustomerButton";
import PortfolioActiveToggle from "@/components/admin/portfolio/PortfolioActiveToggle";
import MarkNegativeButton from "@/components/admin/portfolio/MarkNegativeButton";
import PortfolioContactsHistory from "@/components/admin/portfolio/PortfolioContactsHistory";

export const metadata: Metadata = {
  title: "Müşteri Detayı | Ortisoft CRM",
  robots: { index: false, follow: false },
};

export default async function PortfolioCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [customer, services] = await Promise.all([getPortfolioCustomer(id), listServices()]);
  if (!customer) notFound();

  const infoItems = [
    { icon: User, label: "Yetkili", value: customer.authorizedPerson },
    { icon: Briefcase, label: "Hizmet", value: customer.service?.title ?? "—" },
    { icon: Mail, label: "Firma E-posta", value: customer.companyEmail || "—" },
    { icon: Phone, label: "Firma Telefon", value: customer.companyPhone || "—" },
    { icon: Mail, label: "Yetkili E-posta", value: customer.contactEmail || "—" },
    { icon: Phone, label: "Yetkili Telefon", value: customer.contactPhone || "—" },
    { icon: MapPin, label: "Adres", value: customer.address || "—" },
    { icon: Calendar, label: "Kayıt Tarihi", value: formatGunAyYil(customer.recordDate) },
  ];

  return (
    <div>
      <Link
        href="/admin/crm?tab=portfolio"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ChevronLeft className="h-4 w-4" /> Müşteri Yönetimi&apos;ne dön
      </Link>

      <div className="mb-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">{customer.companyName}</h1>
            {customer.currentStatus && (
              <span className="mt-1.5 inline-block rounded-full bg-red-100 dark:bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:text-red-400">
                {customer.currentStatus.name}
              </span>
            )}
          </div>
          <EditPortfolioCustomerButton
            customer={{
              id: customer.id,
              companyName: customer.companyName,
              authorizedPerson: customer.authorizedPerson,
              serviceId: customer.serviceId,
              description: customer.description,
              address: customer.address,
              companyEmail: customer.companyEmail,
              companyPhone: customer.companyPhone,
              contactEmail: customer.contactEmail,
              contactPhone: customer.contactPhone,
              fileName: customer.fileName,
            }}
            services={services}
          />
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

        {customer.fileName && (
          <a
            href={`/admin/crm/portfolio/${customer.id}/download`}
            className="mt-4 flex w-fit items-center gap-2 rounded-xl border border-violet-200 dark:border-violet-900 bg-violet-50 dark:bg-violet-500/10 px-4 py-3 text-sm font-semibold text-violet-700 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-500/20"
          >
            <Download className="w-4 h-4" /> Dosyayı İndir ({customer.fileName})
          </a>
        )}

        {customer.description && (
          <div
            className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-bold [&_h3]:mt-3 [&_h3]:mb-1.5 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-blue-600 [&_a]:underline"
            // NOT: description sadece admin panelinden Tiptap editörüyle
            // yazılır — kullanıcı girdisi değildir, ek sanitize yapılmıyor
            // (bkz. Contract.content/BlogPost.content ile aynı gerekçe).
            dangerouslySetInnerHTML={{ __html: customer.description }}
          />
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
          <PortfolioActiveToggle customerId={customer.id} isActive={customer.isActive} />
          <MarkNegativeButton customerId={customer.id} />
        </div>
      </div>

      <h2 className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-200">Temas Geçmişi</h2>
      <PortfolioContactsHistory contacts={customer.contacts} />
    </div>
  );
}
