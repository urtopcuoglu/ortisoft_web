"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { USER_ROLES, USER_ROLE_LABEL } from "@/modules/users/schema";
import type { CreateUserFormState, UpdateUserFormState } from "@/modules/users/schema";

// CreateUserFormState ve UpdateUserFormState yapısal olarak aynı şekle sahip
// ({errors?, message?, success?, credentialsEmailSent?} | undefined) — tek bir
// ortak tip üzerinden useActionState'i koşulsuz (rules-of-hooks'a uygun) tek
// seferde çağırabiliriz.
type CommonFormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
      success?: boolean;
      credentialsEmailSent?: boolean;
    }
  | undefined;
type CommonAction = (state: CommonFormState, formData: FormData) => Promise<CommonFormState>;

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20";
const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300";

type ExistingUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR";
  title: string | null;
  department: string | null;
  personalPhone: string | null;
  companyPhone: string | null;
  teamMember: { id: string } | null;
} | null;

type CreateAction = (
  state: CreateUserFormState,
  formData: FormData
) => Promise<CreateUserFormState>;
type UpdateAction = (
  state: UpdateUserFormState,
  formData: FormData
) => Promise<UpdateUserFormState>;

export default function UserForm(
  props:
    | { mode: "create"; action: CreateAction; user?: undefined }
    | { mode: "edit"; action: UpdateAction; user: ExistingUser }
) {
  const { mode, user } = props;
  const [state, formAction, pending] = useActionState(props.action as CommonAction, undefined);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Ad Soyad</label>
          <input name="name" defaultValue={user?.name} className={inputClass} required />
          {state?.errors?.name && <p className="mt-1 text-xs text-red-600">{state.errors.name[0]}</p>}
        </div>
        <div>
          <label className={labelClass}>E-posta (giriş)</label>
          <input type="email" name="email" defaultValue={user?.email} className={inputClass} required />
          {state?.errors?.email && <p className="mt-1 text-xs text-red-600">{state.errors.email[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Görev</label>
          <input name="title" defaultValue={user?.title ?? ""} className={inputClass} placeholder="Örn. Yazılım Geliştiricisi" />
          {state?.errors?.title && <p className="mt-1 text-xs text-red-600">{state.errors.title[0]}</p>}
        </div>
        <div>
          <label className={labelClass}>Departman</label>
          <input name="department" defaultValue={user?.department ?? ""} className={inputClass} placeholder="Örn. Yazılım" />
          {state?.errors?.department && <p className="mt-1 text-xs text-red-600">{state.errors.department[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Kişisel Telefon</label>
          <input name="personalPhone" defaultValue={user?.personalPhone ?? ""} className={inputClass} placeholder="05xx xxx xx xx" />
          {state?.errors?.personalPhone && <p className="mt-1 text-xs text-red-600">{state.errors.personalPhone[0]}</p>}
        </div>
        <div>
          <label className={labelClass}>Şirket Telefonu</label>
          <input name="companyPhone" defaultValue={user?.companyPhone ?? ""} className={inputClass} placeholder="0850 xxx xx xx" />
          {state?.errors?.companyPhone && <p className="mt-1 text-xs text-red-600">{state.errors.companyPhone[0]}</p>}
        </div>
      </div>

      <div>
        <label className={labelClass}>Rol</label>
        <select name="role" defaultValue={user?.role ?? "EDITOR"} className={inputClass}>
          {USER_ROLES.map((r) => (
            <option key={r} value={r}>
              {USER_ROLE_LABEL[r]}
            </option>
          ))}
        </select>
        {state?.errors?.role && <p className="mt-1 text-xs text-red-600">{state.errors.role[0]}</p>}
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          Yönetici tüm modüllere ve kullanıcı yönetimine erişebilir; editör kullanıcı yönetimini göremez.
        </p>
      </div>

      {mode === "create" ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Şifre</label>
            <input type="password" name="password" className={inputClass} required minLength={8} />
            {state?.errors?.password && <p className="mt-1 text-xs text-red-600">{state.errors.password[0]}</p>}
          </div>
          <div>
            <label className={labelClass}>Şifre (tekrar)</label>
            <input type="password" name="confirmPassword" className={inputClass} required minLength={8} />
            {state?.errors?.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">{state.errors.confirmPassword[0]}</p>
            )}
          </div>
        </div>
      ) : (
        <div>
          <label className={labelClass}>
            Yeni Şifre <span className="font-normal text-slate-400 dark:text-slate-500">(boş bırakılırsa değişmez)</span>
          </label>
          <input type="password" name="newPassword" className={inputClass} minLength={8} />
          {state?.errors?.newPassword && <p className="mt-1 text-xs text-red-600">{state.errors.newPassword[0]}</p>}
        </div>
      )}

      {mode === "create" && (
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input type="checkbox" name="addToTeam" className="h-4 w-4 rounded border-slate-300 dark:border-slate-600" />
            Ekibe ekle — Hakkımızda sayfasındaki ekip listesinde ad soyad ve görev ile yayınlansın
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input type="checkbox" name="sendCredentials" className="h-4 w-4 rounded border-slate-300 dark:border-slate-600" />
            Giriş bilgilerini e-posta ile gönder{" "}
            <span className="font-normal text-slate-400 dark:text-slate-500">(şifre açık metin olarak e-postada yer alır)</span>
          </label>
        </div>
      )}

      {state?.message && !state.success && (
        <p className="rounded-lg bg-red-50 dark:bg-red-500/10 px-3.5 py-2.5 text-sm text-red-700 dark:text-red-400">
          {state.message}
        </p>
      )}
      {state?.success && (
        <div className="flex flex-col gap-2">
          <p className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 px-3.5 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
            {state.message ?? "Kaydedildi."}
          </p>
          {state.credentialsEmailSent === true && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 px-3.5 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              Giriş bilgileri e-posta ile gönderildi.
            </div>
          )}
          {state.credentialsEmailSent === false && (
            <p className="rounded-lg bg-amber-50 dark:bg-amber-500/10 px-3.5 py-2.5 text-sm text-amber-800 dark:text-amber-400">
              Kullanıcı oluşturuldu ancak otomatik e-posta gönderimi yapılandırılmamış/başarısız oldu
              (RESEND_API_KEY) — giriş bilgilerini manuel iletmen gerekiyor.
            </p>
          )}
          {mode === "create" && (
            <Link href="/admin/users" className="w-fit text-xs font-semibold text-blue-600 dark:text-blue-400 underline">
              Kullanıcılar listesine dön →
            </Link>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Kaydediliyor…" : mode === "create" ? "Oluştur" : "Kaydet"}
      </button>
    </form>
  );
}
