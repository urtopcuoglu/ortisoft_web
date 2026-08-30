"use client";

import { useActionState, useState } from "react";
import { Send, CheckCircle2, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { submitContactMessage } from "@/modules/messages/actions";
import { MESSAGE_PURPOSES, MESSAGE_PURPOSE_LABEL } from "@/modules/messages/schema";
import type { MessagePurposeValue } from "@/modules/messages/schema";

const field =
  "w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-200";

const CV_ACCEPT = ".pdf,.png,.docx";
const CV_MAX_SIZE_MB = 10;

export default function ContactForm({ serviceOptions }: { serviceOptions: string[] }) {
  const [state, formAction, pending] = useActionState(submitContactMessage, undefined);
  const [purpose, setPurpose] = useState<MessagePurposeValue | "">("");
  const [kvkkChecked, setKvkkChecked] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  if (state?.success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-5">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Mesajınız Alındı!</h3>
        <p className="text-slate-500 text-sm mb-8">
          {state.message ?? "En geç 24 saat içinde size geri döneceğiz. Teşekkür ederiz."}
        </p>
      </div>
    );
  }

  const isService = purpose === "SERVICE";
  const isCv = purpose === "CV";

  return (
    <>
      <h2 className="text-2xl font-bold text-slate-900 mb-1.5">Mesaj Gönderin</h2>
      <p className="text-slate-500 text-sm mb-8">Formu doldurun, en kısa sürede size dönelim.</p>

      <form action={formAction} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Talebiniz <span className="text-red-500">*</span>
          </label>
          <select
            name="purpose"
            required
            value={purpose}
            onChange={(e) => setPurpose(e.target.value as MessagePurposeValue)}
            className={cn(field, "cursor-pointer")}
          >
            <option value="" disabled>Bir seçenek seçin</option>
            {MESSAGE_PURPOSES.map((p) => (
              <option key={p} value={p}>{MESSAGE_PURPOSE_LABEL[p]}</option>
            ))}
          </select>
          {state?.errors?.purpose && <p className="mt-1 text-xs text-red-600">{state.errors.purpose[0]}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Ad Soyad <span className="text-red-500">*</span>
            </label>
            <input type="text" name="name" required placeholder="Adınız Soyadınız" className={field} />
            {state?.errors?.name && <p className="mt-1 text-xs text-red-600">{state.errors.name[0]}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              E-posta <span className="text-red-500">*</span>
            </label>
            <input type="email" name="email" required placeholder="ornek@sirket.com" className={field} />
            {state?.errors?.email && <p className="mt-1 text-xs text-red-600">{state.errors.email[0]}</p>}
          </div>
        </div>

        {/* "Hizmet almak istiyorum" seçilirse görünür */}
        {isService && (
          <div className="space-y-5 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Şirket / Kurum</label>
              <input type="text" name="company" placeholder="Şirket adınız" className={field} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">İlgilendiğiniz Hizmet</label>
              <select name="service" defaultValue="" className={cn(field, "cursor-pointer")}>
                <option value="">Hizmet seçin (isteğe bağlı)</option>
                {serviceOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
                <option value="Diğer">Diğer</option>
              </select>
            </div>
          </div>
        )}

        {/* "CV Göndermek İstiyorum" seçilirse görünür */}
        {isCv && (
          <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              CV Dosyanız <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3.5">
              <Paperclip className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="file"
                name="cvFile"
                accept={CV_ACCEPT}
                required={isCv}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setFileError(null);
                  if (file && file.size > CV_MAX_SIZE_MB * 1024 * 1024) {
                    setFileError(`Dosya boyutu en fazla ${CV_MAX_SIZE_MB}MB olabilir.`);
                    e.target.value = "";
                  }
                }}
                className="w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3.5 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-blue-700"
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-400">PDF, PNG veya DOCX — en fazla 10MB.</p>
            {fileError && <p className="mt-1 text-xs text-red-600">{fileError}</p>}
            {state?.errors?.cvFile && <p className="mt-1 text-xs text-red-600">{state.errors.cvFile[0]}</p>}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Mesajınız {!isCv && <span className="text-red-500">*</span>}
          </label>
          <textarea
            name="message"
            required={!isCv}
            rows={5}
            placeholder={
              isCv
                ? "İsterseniz kısa bir ön yazı ekleyebilirsiniz (opsiyonel)…"
                : "Projenizi veya ihtiyacınızı kısaca anlatın..."
            }
            className={cn(field, "resize-none")}
          />
          {state?.errors?.message && <p className="mt-1 text-xs text-red-600">{state.errors.message[0]}</p>}
        </div>

        {/* Honeypot — gerçek kullanıcılar görmez/doldurmaz, botları yakalamak için */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <label className="flex items-start gap-2.5 text-xs text-slate-500">
          <input
            type="checkbox"
            name="kvkkConsent"
            value="on"
            checked={kvkkChecked}
            onChange={(e) => setKvkkChecked(e.target.checked)}
            required
            className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span>
            <a href="/contracts/kvkk" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 underline">
              KVKK
            </a>{" "}
            Aydınlatma Metni&apos;ni okudum, kişisel verilerimin işlenmesini onaylıyorum.{" "}
            <span className="text-red-500">*</span>
          </span>
        </label>
        {state?.errors?.kvkkConsent && (
          <p className="text-xs text-red-600">{state.errors.kvkkConsent[0]}</p>
        )}

        <Button
          type="submit"
          variant="gradient"
          size="lg"
          className="w-full"
          disabled={pending || !kvkkChecked}
        >
          {pending ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Gönderiliyor...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Mesaj Gönder
            </span>
          )}
        </Button>

        {state?.errors && !state.success && (
          <p className="text-xs text-red-600 text-center">Lütfen formu kontrol edin.</p>
        )}
      </form>
    </>
  );
}
