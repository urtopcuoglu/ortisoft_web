"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { QrCode, X } from "lucide-react";

/**
 * Bir sosyal medya hesabının profil linkini kodlayan QR'ı gösteren küçük
 * buton — görsel, app/(admin)/admin/(protected)/crm/influencer-qr/[accountId]/route.ts
 * tarafından anlık üretilir (qrcode paketi, PNG). Sadece Instagram/TikTok
 * hesaplarında gösterilir (bkz. lib/social-platform.ts#QR_ENABLED_PLATFORM_SLUGS).
 */
export default function InfluencerQrButton({ accountId, label }: { accountId: string; label: string }) {
  const [open, setOpen] = useState(false);
  const src = `/admin/crm/influencer-qr/${accountId}`;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          title="QR kodu göster"
          className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border border-slate-200 dark:border-slate-700 text-slate-400 hover:border-blue-300 hover:text-blue-600 dark:hover:border-blue-700 dark:hover:text-blue-400"
        >
          <QrCode className="h-3 w-3" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-900/50 data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(320px,90vw)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 text-center shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <Dialog.Title className="text-sm font-bold text-slate-900 dark:text-white">{label}</Dialog.Title>
            <Dialog.Close className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          {open && (
            // Dış barındırma/next.config.ts remotePatterns yapılandırması gerektirmeden
            // kendi route handler'ımızdan anlık üretilen görsel için next/image yerine
            // düz <img> kullanılıyor (bkz. app/(public)/layout.tsx'te aynı desen).
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={`${label} QR kodu`}
              className="mx-auto h-56 w-56 rounded-lg border border-slate-100 dark:border-slate-800"
            />
          )}
          <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">Okutunca doğrudan bu profile gider.</p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
