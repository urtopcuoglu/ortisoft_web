import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReferenceForm from "@/components/admin/ReferenceForm";
import { getReference, updateReference } from "@/modules/references/actions";

export const metadata: Metadata = {
  title: "Referansı Düzenle | Ortisoft Admin",
  robots: { index: false, follow: false },
};

export default async function EditReferencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reference = await getReference(id);
  if (!reference) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-extrabold text-slate-900 dark:text-white">Referansı Düzenle</h1>
      <ReferenceForm action={updateReference.bind(null, id)} reference={reference} />
    </div>
  );
}
