"use client";

import { useActionState } from "react";
import { COLOR_THEME_NAMES } from "@/lib/color-theme";
import type { TeamMemberFormState } from "@/modules/about/schema";
import type { TeamMember } from "@/lib/generated/prisma/client";

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20";

type Action = (
  state: TeamMemberFormState,
  formData: FormData
) => Promise<TeamMemberFormState>;

export default function TeamMemberForm({
  action,
  member,
  submitLabel = "Kaydet",
}: {
  action: Action;
  member?: TeamMember;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const specialtiesText = Array.isArray(member?.specialties)
    ? (member.specialties as string[]).join("\n")
    : "";
  const isLinked = Boolean(member?.linkedUserId);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-5">
      {isLinked && (
        <p className="rounded-lg bg-blue-50 dark:bg-blue-500/10 px-3.5 py-2.5 text-sm text-blue-700 dark:text-blue-400">
          Bu ekip üyesi bir kullanıcı hesabına bağlı — isim ve unvan{" "}
          <a href={`/admin/users/${member!.linkedUserId}/edit`} className="font-semibold underline">
            Kullanıcılar panelinden
          </a>{" "}
          yönetilir, buradan değiştirilemez.
        </p>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">İsim</label>
          <input
            name="name"
            defaultValue={member?.name}
            className={`${inputClass} ${isLinked ? "cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400" : ""}`}
            readOnly={isLinked}
            required
          />
          {state?.errors?.name && <p className="mt-1 text-xs text-red-600">{state.errors.name[0]}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Unvan</label>
          <input
            name="role"
            defaultValue={member?.role}
            className={`${inputClass} ${isLinked ? "cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400" : ""}`}
            readOnly={isLinked}
            required
          />
          {state?.errors?.role && <p className="mt-1 text-xs text-red-600">{state.errors.role[0]}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Kısa Biyografi</label>
        <textarea name="bio" rows={2} defaultValue={member?.bio} className={inputClass} />
        {state?.errors?.bio && <p className="mt-1 text-xs text-red-600">{state.errors.bio[0]}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Fotoğraf URL&apos;si <span className="font-normal text-slate-400 dark:text-slate-500">(boş bırakılırsa baş harf rozeti gösterilir)</span>
          </label>
          <input name="photoUrl" defaultValue={member?.photoUrl ?? ""} className={inputClass} />
          {state?.errors?.photoUrl && <p className="mt-1 text-xs text-red-600">{state.errors.photoUrl[0]}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">LinkedIn URL&apos;si</label>
          <input name="linkedinUrl" defaultValue={member?.linkedinUrl ?? ""} className={inputClass} />
          {state?.errors?.linkedinUrl && <p className="mt-1 text-xs text-red-600">{state.errors.linkedinUrl[0]}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Uzmanlık Etiketleri <span className="font-normal text-slate-400 dark:text-slate-500">(her satıra bir tane)</span>
        </label>
        <textarea name="specialties" rows={3} defaultValue={specialtiesText} className={inputClass} />
        {state?.errors?.specialties && <p className="mt-1 text-xs text-red-600">{state.errors.specialties[0]}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Renk Teması</label>
          <select name="colorTheme" defaultValue={member?.colorTheme ?? "blue"} className={inputClass}>
            {COLOR_THEME_NAMES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Sıra</label>
          <input
            type="number"
            name="sortOrder"
            defaultValue={member?.sortOrder ?? 0}
            className={inputClass}
          />
        </div>
      </div>

      {state?.success && (
        <p className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 px-3.5 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">Kaydedildi.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Kaydediliyor…" : submitLabel}
      </button>
    </form>
  );
}
