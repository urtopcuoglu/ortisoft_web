import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Yönetici Girişi | Ortisoft",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-extrabold text-slate-900">
          Ortisoft Admin
        </h1>
        <p className="mb-6 text-sm text-slate-500">
          Devam etmek için giriş yapın.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
