"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPasswordWithToken } from "@/modules/auth/actions";
import type { ResetPasswordFormState } from "@/modules/auth/schema";

const inputClass =
  "rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20";

export default function ResetPasswordForm({ token }: { token: string }) {
  const action = resetPasswordWithToken.bind(null, token) as (
    state: ResetPasswordFormState,
    formData: FormData
  ) => Promise<ResetPasswordFormState>;
  const [state, formAction, pending] = useActionState(action, undefined);

  if (state?.success) {
    return (
      <div className="flex flex-col gap-4">
        <p className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 px-3.5 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
          {state.message}
        </p>
        <Link
          href="/admin/login"
          className="text-center text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          Giriş sayfasına dön →
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="newPassword" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Yeni Şifre
        </label>
        <input id="newPassword" name="newPassword" type="password" autoComplete="new-password" required className={inputClass} />
        {state?.errors?.newPassword && <p className="text-xs text-red-600">{state.errors.newPassword[0]}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Yeni Şifre (Tekrar)
        </label>
        <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required className={inputClass} />
        {state?.errors?.confirmPassword && <p className="text-xs text-red-600">{state.errors.confirmPassword[0]}</p>}
      </div>

      {state?.message && !state.success && (
        <p className="rounded-lg bg-red-50 dark:bg-red-500/10 px-3.5 py-2.5 text-sm text-red-700 dark:text-red-400">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Kaydediliyor…" : "Şifreyi Güncelle"}
      </button>
    </form>
  );
}
