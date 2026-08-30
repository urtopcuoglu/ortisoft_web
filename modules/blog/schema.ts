import { z } from "zod";

export const BLOG_STATUSES = ["DRAFT", "SCHEDULED", "PUBLISHED"] as const;
export type BlogStatusValue = (typeof BLOG_STATUSES)[number];

export const BlogPostSchema = z.object({
  title: z.string().trim().min(2, { error: "Başlık en az 2 karakter olmalı." }),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, { error: "Slug sadece küçük harf, rakam ve tire içerebilir." }),
  excerpt: z.string().trim().min(10, { error: "Özet en az 10 karakter olmalı." }).max(300),
  content: z.string().trim().min(20, { error: "İçerik en az 20 karakter olmalı." }),
  coverImage: z
    .union([z.url({ error: "Geçerli bir görsel URL'si girin." }), z.literal("")])
    .optional(),
  // Formdan çok satırlı metin olarak gelir, her satır bir etiket.
  tags: z
    .string()
    .transform((val) =>
      val
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
    ),
  status: z.enum(BLOG_STATUSES, { error: "Geçerli bir durum seçin." }),
  seoTitle: z.union([z.string().trim().max(70), z.literal("")]).optional(),
  seoDescription: z.union([z.string().trim().max(200), z.literal("")]).optional(),
  focusKeyword: z.union([z.string().trim().max(100), z.literal("")]).optional(),
});

export type BlogPostFormState =
  | { errors?: Record<string, string[]>; message?: string; success?: boolean }
  | undefined;
