import { z } from "zod";
import { ICON_NAMES } from "@/lib/icon-map";
import { COLOR_THEME_NAMES } from "@/lib/color-theme";

function multiline(errorEmpty: string) {
  return z
    .string()
    .transform((val) =>
      val
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
    )
    .refine((arr) => arr.length > 0, { error: errorEmpty });
}

export const ProjectSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, { error: "Slug sadece küçük harf, rakam ve tire içerebilir." }),
  title: z.string().trim().min(2, { error: "Başlık en az 2 karakter olmalı." }),
  status: z.enum(["COMING_SOON", "IN_DEVELOPMENT", "ACTIVE"], { error: "Geçerli bir durum seçin." }),
  fundingLabel: z.string().trim().min(2, { error: "Fon/kaynak etiketi en az 2 karakter olmalı." }),
  tagline: z.string().trim().min(5, { error: "Tagline en az 5 karakter olmalı." }),
  description: z.string().trim().min(10, { error: "Açıklama en az 10 karakter olmalı." }),
  // Formdan çok satırlı metin olarak gelir, her satır bir madde.
  tags: multiline("En az bir etiket girin."),
  icon: z.enum(ICON_NAMES, { error: "Geçerli bir ikon seçin." }),
  colorTheme: z.enum(COLOR_THEME_NAMES, { error: "Geçerli bir renk teması seçin." }),
  features: multiline("En az bir özellik girin."),
  // techStack opsiyonel — boşsa null olarak saklanır.
  techStack: z.string().transform((val) => {
    const arr = val.split("\n").map((s) => s.trim()).filter(Boolean);
    return arr.length > 0 ? arr : null;
  }),
  sortOrder: z.coerce.number().int().default(0),
});

export type ProjectFormState =
  | { errors?: Record<string, string[]>; message?: string; success?: boolean }
  | undefined;
