import { z } from "zod";

export const MESSAGE_PURPOSES = [
  "INFO",
  "SUPPORT",
  "SERVICE",
  "PARTNERSHIP",
  "CV",
] as const;
export type MessagePurposeValue = (typeof MESSAGE_PURPOSES)[number];

export const MESSAGE_PURPOSE_LABEL: Record<MessagePurposeValue, string> = {
  INFO: "Bilgi almak istiyorum",
  SUPPORT: "Destek Talebi",
  SERVICE: "Hizmet almak istiyorum",
  PARTNERSHIP: "Çözüm Ortağınız Olmak İstiyorum",
  CV: "CV Göndermek İstiyorum",
};

export const CV_MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const CV_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
] as const;
export const CV_ALLOWED_EXTENSIONS = [".pdf", ".png", ".docx"] as const;

// Public iletişim formu — herkes gönderebilir, bu yüzden kısıtlar sıkı tutulur.
// Dosya (CV) alanı burada DEĞİL — File nesneleri Server Action içinde ayrıca
// (boyut/tip) doğrulanıp Supabase Storage'a yüklenir.
export const ContactFormSchema = z
  .object({
    purpose: z.enum(MESSAGE_PURPOSES, { error: "Lütfen bir seçenek seçin." }),
    name: z.string().trim().min(2, { error: "Ad soyad en az 2 karakter olmalı." }).max(200),
    email: z.email({ error: "Geçerli bir e-posta adresi girin." }).trim(),
    phone: z.union([z.string().trim().max(50), z.literal("")]).optional(),
    company: z.union([z.string().trim().max(200), z.literal("")]).optional(),
    service: z.union([z.string().trim().max(200), z.literal("")]).optional(),
    message: z.union([z.string().trim().max(5000), z.literal("")]).optional(),
    // Checkbox işaretliyse tarayıcı "on" gönderir; boşsa alan formData'da hiç yer almaz.
    kvkkConsent: z.literal("on", { error: "Devam etmek için KVKK metnini onaylamalısınız." }),
    // Bot doldurma tuzağı: gerçek kullanıcılar bu alanı görmez/doldurmaz.
    // Kasıtlı olarak kısıtlama yok — dolu gelirse Server Action seviyesinde
    // sessizce yutulur; burada reddedersek bot "başarısız oldu" sinyali alır.
    website: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // CV dışındaki amaçlarda mesaj zorunlu; CV'de dosya asıl içerik olduğu için
    // mesaj isteğe bağlıdır.
    if (data.purpose !== "CV") {
      if (!data.message || data.message.length < 10) {
        ctx.addIssue({
          code: "custom",
          path: ["message"],
          message: "Mesajınız en az 10 karakter olmalı.",
        });
      }
    }
  });

export type ContactFormState =
  | { errors?: Record<string, string[]>; message?: string; success?: boolean }
  | undefined;

export const ReplySchema = z.object({
  body: z.string().trim().min(5, { error: "Yanıt en az 5 karakter olmalı." }),
});

export type ReplyFormState =
  | { errors?: Record<string, string[]>; message?: string; success?: boolean; replyBody?: string }
  | undefined;

export const MESSAGE_STATUSES = ["NEW", "IN_PROGRESS", "REPLIED", "CLOSED"] as const;
export type MessageStatusValue = (typeof MESSAGE_STATUSES)[number];
