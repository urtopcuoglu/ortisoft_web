import type { Metadata } from "next";
import Link from "next/link";
import { getPasswordResetRequestByToken } from "@/modules/auth/actions";
import ResetPasswordForm from "@/components/admin/ResetPasswordForm";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Yeni Şifre Belirle | Ortisoft Admin",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const request = await getPasswordResetRequestByToken(token);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
        <div className="mb-1 flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Yeni Şifre Belirle</h1>
          <ThemeToggle />
        </div>

        {!request ? (
          <>
            <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
              Bu bağlantı geçersiz, süresi dolmuş ya da zaten kullanılmış.
            </p>
            <Link
              href="/admin/forgot-password"
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Yeni bir talep oluştur →
            </Link>
          </>
        ) : (
          <>
            <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
              Hesabınız için yeni bir şifre belirleyin.
            </p>
            <ResetPasswordForm token={token} />
          </>
        )}
      </div>
    </div>
  );
}
