import { z } from "zod";
import { ICON_NAMES } from "@/lib/icon-map";
import { COLOR_THEME_NAMES } from "@/lib/color-theme";

export const ServiceSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, { error: "Slug sadece küçük harf, rakam ve tire içerebilir." }),
  icon: z.enum(ICON_NAMES, { error: "Geçerli bir ikon seçin." }),
  tag: z.string().trim().min(2, { error: "Etiket en az 2 karakter olmalı." }),
  title: z.string().trim().min(2, { error: "Başlık en az 2 karakter olmalı." }),
  description: z.string().trim().min(10, { error: "Açıklama en az 10 karakter olmalı." }),
  // Formdan çok satırlı metin olarak gelir, her satır bir özellik/madde.
  features: z
    .string()
    .transform((val) =>
      val
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
    )
    .refine((arr) => arr.length > 0, { error: "En az bir özellik/madde girin." }),
  colorTheme: z.enum(COLOR_THEME_NAMES, { error: "Geçerli bir renk teması seçin." }),
  sortOrder: z.coerce.number().int().default(0),
});

export type ServiceFormState =
  | { errors?: Record<string, string[]>; message?: string; success?: boolean }
  | undefined;
