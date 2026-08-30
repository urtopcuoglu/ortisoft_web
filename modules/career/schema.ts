import { z } from "zod";

export const CareerPostingSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, { error: "Slug sadece küçük harf, rakam ve tire içerebilir." }),
  title: z.string().trim().min(2, { error: "Başlık en az 2 karakter olmalı." }),
  description: z.string().trim().min(10, { error: "Açıklama en az 10 karakter olmalı." }),
  // Formdan çok satırlı metin olarak gelir, her satır bir gereksinim maddesi.
  requirements: z
    .string()
    .transform((val) =>
      val
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
    )
    .refine((arr) => arr.length > 0, { error: "En az bir gereksinim/madde girin." }),
  location: z.string().trim().min(2, { error: "Konum en az 2 karakter olmalı." }),
  employmentType: z.string().trim().min(2, { error: "Çalışma şekli en az 2 karakter olmalı." }),
  applyEmail: z.email({ error: "Geçerli bir e-posta adresi girin." }),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"], { error: "Geçerli bir durum seçin." }),
});

export type CareerPostingFormState =
  | { errors?: Record<string, string[]>; message?: string; success?: boolean }
  | undefined;
