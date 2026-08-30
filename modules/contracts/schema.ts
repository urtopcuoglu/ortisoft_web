import { z } from "zod";

export const ContractSchema = z.object({
  title: z.string().trim().min(2, { error: "Başlık en az 2 karakter olmalı." }),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, { error: "Slug sadece küçük harf, rakam ve tire içerebilir." }),
  content: z.string().trim().min(20, { error: "İçerik en az 20 karakter olmalı." }),
  sortOrder: z.coerce.number().int().default(0),
});

export type ContractFormState =
  | { errors?: Record<string, string[]>; message?: string; success?: boolean }
  | undefined;
