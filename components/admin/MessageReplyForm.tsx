"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
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
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
      <h3 className="mb-3 text-sm font-bold text-slate-800 dark:text-slate-200">Yanıt Yaz</h3>
      <form action={formAction} className="flex flex-col gap-3">
        <textarea
          name="body"
          rows={4}
          placeholder="Yanıtınızı buraya yazın…"
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20"
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

      {state?.success && state.emailSent && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          Yanıt kaydedildi ve e-posta olarak otomatik gönderildi.
        </div>
      )}

      {mailtoHref && state?.emailSent === false && (
        <div className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-400">
          Yanıt kaydedildi, ancak otomatik e-posta gönderimi yapılandırılmamış (RESEND_API_KEY).{" "}
          <a href={mailtoHref} className="font-semibold underline">
            E-posta istemcinde taslağı aç →
          </a>
        </div>
      )}
    </div>
  );
}
