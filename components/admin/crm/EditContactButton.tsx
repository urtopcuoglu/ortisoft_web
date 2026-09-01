"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import GuideContactModal, { type GuideContactForEdit } from "@/components/admin/GuideContactModal";

export default function EditContactButton({
  contact,
  categories,
  users,
}: {
  contact: GuideContactForEdit;
  categories: { id: string; name: string }[];
  users: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
      >
        <Pencil className="h-3.5 w-3.5" /> Firma Bilgilerini Düzenle
      </button>
      <GuideContactModal open={open} onOpenChange={setOpen} categories={categories} users={users} contact={contact} />
    </>
  );
}
