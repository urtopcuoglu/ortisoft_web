import { z } from "zod";
import { ICON_NAMES } from "@/lib/icon-map";
import { COLOR_THEME_NAMES } from "@/lib/color-theme";

export const PRICING_CURRENCIES = ["TRY", "USD"] as const;
export type PricingCurrency = (typeof PRICING_CURRENCIES)[number];

// Bir hizmetin altında dinamik/sonsuz sayıda eklenebilen alt hizmet.
// label+description public /services sayfasında gösterilir; price SADECE
// admin panelinde görünür, hiçbir public bileşen bu alanı okumaz.
export const SubServiceSchema = z.object({
  label: z.string().trim().min(2, { error: "Alt hizmet adı en az 2 karakter olmalı." }),
  description: z.string().trim().min(1, { error: "Alt hizmet açıklaması girin." }),
  // Sıra ÖNEMLİ: z.null() önce denenmeli — aksi halde z.coerce.number() literal
  // `null`'ı JS'in Number(null)===0 davranışıyla sessizce 0'a çevirir.
  price: z.union([z.null(), z.coerce.number().nonnegative()]).optional().default(null),
});
export type SubService = z.infer<typeof SubServiceSchema>;

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
  colorTheme: z.enum(COLOR_THEME_NAMES, { error: "Geçerli bir renk teması seçin." }),
  sortOrder: z.coerce.number().int().default(0),
  pricingCurrency: z.enum(PRICING_CURRENCIES).default("TRY"),
  // Formdan tek bir gizli input'ta JSON string olarak gelir (bkz. ServiceForm.tsx'teki
  // dinamik "alt hizmet ekle/çıkar" tekrarlayıcısı) — bir textarea/satır formatına
  // sıkıştırmak yerine yapılandırılmış veriyi doğrudan JSON olarak taşımak daha sağlam.
  subServicesJson: z
    .string()
    .transform((val, ctx) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(val || "[]");
      } catch {
        ctx.addIssue({ code: "custom", message: "Alt hizmet verisi okunamadı." });
        return z.NEVER;
      }
      const result = z.array(SubServiceSchema).min(1, { error: "En az bir alt hizmet ekleyin." }).safeParse(parsed);
      if (!result.success) {
        ctx.addIssue({ code: "custom", message: "Alt hizmetlerden biri eksik/hatalı — her birinde ad ve açıklama gerekli." });
        return z.NEVER;
      }
      return result.data;
    }),
});

export type ServiceFormState =
  | { errors?: Record<string, string[]>; message?: string; success?: boolean }
  | undefined;
