"use client";

import { useActionState } from "react";
import { changePassword } from "@/modules/auth/actions";

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20";

export default function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, undefined);

  return (
    <form action={formAction} className="flex max-w-sm flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Mevcut Şifre
        </label>
        <input type="password" name="currentPassword" className={inputClass} required autoComplete="current-password" />
        {state?.errors?.currentPassword && (
          <p className="mt-1 text-xs text-red-600">{state.errors.currentPassword[0]}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Yeni Şifre
        </label>
        <input type="password" name="newPassword" className={inputClass} required autoComplete="new-password" />
        {state?.errors?.newPassword && (
          <p className="mt-1 text-xs text-red-600">{state.errors.newPassword[0]}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Yeni Şifre (Tekrar)
        </label>
        <input type="password" name="confirmPassword" className={inputClass} required autoComplete="new-password" />
        {state?.errors?.confirmPassword && (
          <p className="mt-1 text-xs text-red-600">{state.errors.confirmPassword[0]}</p>
        )}
      </div>

      {state?.message && (
        <p
          className={
            state.success
              ? "rounded-lg bg-emerald-50 dark:bg-emerald-500/10 px-3.5 py-2.5 text-sm text-emerald-700 dark:text-emerald-400"
              : "rounded-lg bg-red-50 dark:bg-red-500/10 px-3.5 py-2.5 text-sm text-red-700 dark:text-red-400"
          }
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Kaydediliyor…" : "Şifreyi Güncelle"}
      </button>
    </form>
  );
}
