import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CareerPostingForm from "@/components/admin/CareerPostingForm";
import { getCareerPosting, updateCareerPosting } from "@/modules/career/actions";

export const metadata: Metadata = {
  title: "İlanı Düzenle | Ortisoft Admin",
  robots: { index: false, follow: false },
};

export default async function EditCareerPostingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const posting = await getCareerPosting(id);
  if (!posting) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-extrabold text-slate-900">İlanı Düzenle</h1>
      <CareerPostingForm action={updateCareerPosting.bind(null, id)} posting={posting} />
    </div>
  );
}
