import type { Metadata } from "next";
import ContractForm from "@/components/admin/ContractForm";
import { createContract } from "@/modules/contracts/actions";

export const metadata: Metadata = {
  title: "Yeni Sözleşme | Ortisoft Admin",
  robots: { index: false, follow: false },
};

export default function NewContractPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-extrabold text-slate-900 dark:text-white">Yeni Sözleşme</h1>
      <ContractForm action={createContract} submitLabel="Oluştur" />
    </div>
  );
}
