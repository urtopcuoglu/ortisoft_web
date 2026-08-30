import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Yönetici Girişi | Ortisoft",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
        <div className="mb-1 flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Ortisoft Admin
          </h1>
          <ThemeToggle />
        </div>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          Devam etmek için giriş yapın.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
