"use client";

import { useActionState } from "react";
import { login } from "@/modules/auth/actions";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-semibold text-slate-700">
          E-posta
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        {state?.errors?.email && (
          <p className="text-xs text-red-600">{state.errors.email[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-semibold text-slate-700">
          Şifre
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        {state?.errors?.password && (
          <p className="text-xs text-red-600">{state.errors.password[0]}</p>
        )}
      </div>

      {state?.message && (
        <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Giriş yapılıyor…" : "Giriş Yap"}
      </button>
    </form>
  );
}
