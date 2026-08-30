import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ContractForm from "@/components/admin/ContractForm";
import { getContract, updateContract } from "@/modules/contracts/actions";

export const metadata: Metadata = {
  title: "Sözleşmeyi Düzenle | Ortisoft Admin",
  robots: { index: false, follow: false },
};

export default async function EditContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contract = await getContract(id);
  if (!contract) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-extrabold text-slate-900 dark:text-white">Sözleşmeyi Düzenle</h1>
      <ContractForm action={updateContract.bind(null, id)} contract={contract} />
    </div>
  );
}
