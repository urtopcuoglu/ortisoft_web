import type { Metadata } from "next";
import Link from "next/link";
import ForgotPasswordForm from "@/components/admin/ForgotPasswordForm";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Şifremi Unuttum | Ortisoft Admin",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
        <div className="mb-1 flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Şifremi Unuttum</h1>
          <ThemeToggle />
        </div>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          E-posta adresinizi girin. Sistemde otomatik mail gönderimi yok — bir yönetici talebinizi
          admin panelinden onaylayınca size başka bir kanaldan (telefon/mesaj) ulaşılacak.
        </p>
        <ForgotPasswordForm />
        <Link
          href="/admin/login"
          className="mt-4 block text-center text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Giriş sayfasına dön
        </Link>
      </div>
    </div>
  );
}
