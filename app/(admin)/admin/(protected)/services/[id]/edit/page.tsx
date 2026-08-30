import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServiceForm from "@/components/admin/ServiceForm";
import { getService, updateService } from "@/modules/services/actions";

export const metadata: Metadata = {
  title: "Hizmeti Düzenle | Ortisoft Admin",
  robots: { index: false, follow: false },
};

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await getService(id);
  if (!service) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-extrabold text-slate-900">Hizmeti Düzenle</h1>
      <ServiceForm action={updateService.bind(null, id)} service={service} />
    </div>
  );
}
