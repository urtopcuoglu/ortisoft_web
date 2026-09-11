"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import PortfolioCustomerModal, { type PortfolioCustomerForEdit } from "./PortfolioCustomerModal";

export default function EditPortfolioCustomerButton({
  customer,
  services,
}: {
  customer: PortfolioCustomerForEdit;
  services: { id: string; title: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
      >
        <Pencil className="h-3.5 w-3.5" /> Müşteri Bilgilerini Düzenle
      </button>
      <PortfolioCustomerModal open={open} onOpenChange={setOpen} services={services} customer={customer} />
    </>
  );
}
