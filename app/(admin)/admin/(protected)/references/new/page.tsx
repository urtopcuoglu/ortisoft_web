import type { Metadata } from "next";
import ReferenceForm from "@/components/admin/ReferenceForm";
import { createReference } from "@/modules/references/actions";

export const metadata: Metadata = {
  title: "Yeni Referans | Ortisoft Admin",
  robots: { index: false, follow: false },
};

export default function NewReferencePage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-extrabold text-slate-900">Yeni Referans</h1>
      <ReferenceForm action={createReference} submitLabel="Oluştur" />
    </div>
  );
}
