"use client";

import { useActionState } from "react";
import { createReply } from "@/modules/messages/actions";
import type { ReplyFormState } from "@/modules/messages/schema";

export default function MessageReplyForm({
  messageId,
  recipientEmail,
  recipientName,
  subject,
}: {
  messageId: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
}) {
  const action = createReply.bind(null, messageId) as (
    state: ReplyFormState,
    formData: FormData
  ) => Promise<ReplyFormState>;
  const [state, formAction, pending] = useActionState(action, undefined);

  const mailtoHref =
    state?.success && state.replyBody
      ? `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
          `Merhaba ${recipientName},\n\n${state.replyBody}\n\nSaygılarımızla,\nOrtisoft`
        )}`
      : null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="mb-3 text-sm font-bold text-slate-800">Yanıt Yaz</h3>
      <form action={formAction} className="flex flex-col gap-3">
        <textarea
          name="body"
          rows={4}
          placeholder="Yanıtınızı buraya yazın…"
          className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          required
        />
        {state?.errors?.body && <p className="text-xs text-red-600">{state.errors.body[0]}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-fit rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {pending ? "Kaydediliyor…" : "Yanıtı Kaydet"}
        </button>
      </form>

      {mailtoHref && (
        <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Yanıt kaydedildi.{" "}
          <a href={mailtoHref} className="font-semibold underline">
            E-posta istemcinde taslağı aç →
          </a>
          <p className="mt-1 text-xs text-emerald-700">
            (Not: Şimdilik e-posta otomatik gönderilmiyor, mailto: ile e-posta programın açılır. İleride
            otomatik gönderim eklenecek.)
          </p>
        </div>
      )}
    </div>
  );
}
