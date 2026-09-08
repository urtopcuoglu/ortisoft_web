"use client";

import { useActionState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { createInfluencer, updateInfluencer } from "@/modules/influencer/actions";
import type { InfluencerFormState } from "@/modules/influencer/schema";
import InfluencerAccountRepeater, { type InfluencerAccountRow } from "./InfluencerAccountRepeater";

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20";
const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300";

export type InfluencerForEdit = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  accounts: InfluencerAccountRow[];
};

export default function InfluencerModal({
  open,
  onOpenChange,
  platforms,
  influencer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platforms: { id: string; name: string }[];
  influencer?: InfluencerForEdit | null;
}) {
  const isEdit = !!influencer;
  const action = isEdit
    ? (updateInfluencer.bind(null, influencer.id) as (
        state: InfluencerFormState,
        formData: FormData
      ) => Promise<InfluencerFormState>)
    : createInfluencer;
  const [state, formAction, pending] = useActionState(action, undefined);

  useEffect(() => {
    if (state?.success) onOpenChange(false);
  }, [state?.success, onOpenChange]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-900/50 data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(680px,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
          <div className="mb-5 flex items-center justify-between">
            <Dialog.Title className="text-lg font-extrabold text-slate-900 dark:text-white">
              {isEdit ? "Influencer Kaydını Düzenle" : "Yeni Influencer Ekle"}
            </Dialog.Title>
            <Dialog.Close className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-slate-200">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <form action={formAction} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Adı</label>
                <input name="firstName" defaultValue={influencer?.firstName ?? ""} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Soyadı</label>
                <input name="lastName" defaultValue={influencer?.lastName ?? ""} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Mail Adresi</label>
                <input name="email" type="email" defaultValue={influencer?.email ?? ""} className={inputClass} />
                {state?.errors?.email && <p className="mt-1 text-xs text-red-600">{state.errors.email[0]}</p>}
              </div>
              <div>
                <label className={labelClass}>Telefon Numarası</label>
                <input name="phone" type="tel" defaultValue={influencer?.phone ?? ""} className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Sosyal Medya Hesapları{" "}
                <span className="font-normal text-slate-400 dark:text-slate-500">(kullanıcı adı zorunlu)</span>
              </label>
              <InfluencerAccountRepeater name="accountsJson" platforms={platforms} initial={influencer?.accounts ?? []} />
              {state?.errors?.accountsJson && (
                <p className="mt-1 text-xs text-red-600">{state.errors.accountsJson[0]}</p>
              )}
            </div>

            {state?.message && !state.success && (
              <p className="rounded-lg bg-red-50 dark:bg-red-500/10 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400">
                {state.message}
              </p>
            )}

            <div className="mt-2 flex justify-end gap-2">
              <Dialog.Close className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5">
                Vazgeç
              </Dialog.Close>
              <button
                type="submit"
                disabled={pending}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {pending ? "Kaydediliyor…" : isEdit ? "Kaydet" : "Ekle"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
