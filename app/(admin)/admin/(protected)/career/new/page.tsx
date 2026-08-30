import type { Metadata } from "next";
import CareerPostingForm from "@/components/admin/CareerPostingForm";
import { createCareerPosting } from "@/modules/career/actions";

export const metadata: Metadata = {
  title: "Yeni İlan | Ortisoft Admin",
  robots: { index: false, follow: false },
};

export default function NewCareerPostingPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-extrabold text-slate-900">Yeni Kariyer İlanı</h1>
      <CareerPostingForm action={createCareerPosting} submitLabel="Oluştur" />
    </div>
  );
}
