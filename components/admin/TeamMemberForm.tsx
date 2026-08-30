"use client";

import { useActionState } from "react";
import { COLOR_THEME_NAMES } from "@/lib/color-theme";
import type { TeamMemberFormState } from "@/modules/about/schema";
import type { TeamMember } from "@/lib/generated/prisma/client";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

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

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">İsim</label>
          <input name="name" defaultValue={member?.name} className={inputClass} required />
          {state?.errors?.name && <p className="mt-1 text-xs text-red-600">{state.errors.name[0]}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Unvan</label>
          <input name="role" defaultValue={member?.role} className={inputClass} required />
          {state?.errors?.role && <p className="mt-1 text-xs text-red-600">{state.errors.role[0]}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">Kısa Biyografi</label>
        <textarea name="bio" rows={2} defaultValue={member?.bio} className={inputClass} />
        {state?.errors?.bio && <p className="mt-1 text-xs text-red-600">{state.errors.bio[0]}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Fotoğraf URL&apos;si <span className="font-normal text-slate-400">(boş bırakılırsa baş harf rozeti gösterilir)</span>
          </label>
          <input name="photoUrl" defaultValue={member?.photoUrl ?? ""} className={inputClass} />
          {state?.errors?.photoUrl && <p className="mt-1 text-xs text-red-600">{state.errors.photoUrl[0]}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">LinkedIn URL&apos;si</label>
          <input name="linkedinUrl" defaultValue={member?.linkedinUrl ?? ""} className={inputClass} />
          {state?.errors?.linkedinUrl && <p className="mt-1 text-xs text-red-600">{state.errors.linkedinUrl[0]}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
          Uzmanlık Etiketleri <span className="font-normal text-slate-400">(her satıra bir tane)</span>
        </label>
        <textarea name="specialties" rows={3} defaultValue={specialtiesText} className={inputClass} />
        {state?.errors?.specialties && <p className="mt-1 text-xs text-red-600">{state.errors.specialties[0]}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Renk Teması</label>
          <select name="colorTheme" defaultValue={member?.colorTheme ?? "blue"} className={inputClass}>
            {COLOR_THEME_NAMES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Sıra</label>
          <input
            type="number"
            name="sortOrder"
            defaultValue={member?.sortOrder ?? 0}
            className={inputClass}
          />
        </div>
      </div>

      {state?.success && (
        <p className="rounded-lg bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">Kaydedildi.</p>
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
