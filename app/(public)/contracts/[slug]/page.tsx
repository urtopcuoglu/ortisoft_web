import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { getContractBySlug } from "@/modules/contracts/actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const contract = await getContractBySlug(slug);
  return { title: contract ? `${contract.title} | Ortisoft` : "Sözleşme | Ortisoft" };
}

export default async function ContractPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const contract = await getContractBySlug(slug);
  if (!contract) notFound();

  return (
    <div className="flex flex-col">
      <section className="relative py-24 md:py-32 overflow-hidden animated-gradient">
        <div className="absolute inset-0 grid-pattern" />
        <div className="relative z-10 narrow-container text-center">
          <Badge className="mb-6 bg-white/10 text-white border-white/20">Yasal</Badge>
          <h1 className="heading-lg text-white">
            <span className="gradient-text">{contract.title}</span>
          </h1>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="narrow-container">
          <div
            className="text-sm leading-relaxed text-slate-600 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-4 [&_h3]:mb-1.5 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_a]:text-blue-600 [&_a]:underline"
            // NOT: content sadece admin panelinden (tek admin hesabı) Tiptap editörüyle
            // yazılır — kullanıcı girdisi değildir, bu yüzden ek sanitize yapılmıyor.
            dangerouslySetInnerHTML={{ __html: contract.content }}
          />
        </div>
      </section>
    </div>
  );
}
