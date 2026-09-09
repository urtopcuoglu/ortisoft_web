import { z } from "zod";

// Platform dropdown'ındaki "yeni platform ekle" satırının sentinel değeri —
// hem select'te (components/admin/influencer/InfluencerAccountRepeater.tsx)
// hem de sunucu tarafında (modules/influencer/actions.ts#resolvePlatform)
// kullanılır. GuideCategory'deki NEW_CATEGORY_VALUE ile aynı desen.
export const NEW_PLATFORM_VALUE = "__new_platform__";

// Bir influencer'ın tek bir sosyal medya hesabı — formdan tek bir gizli
// input'ta JSON dizi olarak gelir (bkz. Service modülündeki subServicesJson
// deseni). TEK zorunlu alan `username` — platform select'i zaten her zaman
// bir değere sahip (mevcut bir platform ya da "yeni platform ekle"), diğer
// alanlar (profileUrl, followerCount) opsiyonel.
export const InfluencerAccountInputSchema = z.object({
  platformId: z.string().trim().min(1, { error: "Platform seçin." }),
  newPlatformName: z.string().trim().default(""),
  username: z.string().trim().min(1, { error: "Kullanıcı adı girin." }),
  profileUrl: z.union([z.url({ error: "Geçerli bir link girin." }), z.literal("")]).default(""),
  followerCount: z.coerce.number().int().nonnegative().default(0),
});
export type InfluencerAccountInput = z.infer<typeof InfluencerAccountInputSchema>;

export const InfluencerSchema = z.object({
  firstName: z.string().trim().default(""),
  lastName: z.string().trim().default(""),
  email: z.union([z.email({ error: "Geçerli bir e-posta girin." }), z.literal("")]).default(""),
  phone: z.string().trim().default(""),
  address: z.string().trim().default(""),
  // Formdan tek bir gizli input'ta JSON string olarak gelir (bkz.
  // components/admin/influencer/InfluencerAccountRepeater.tsx) — en az bir
  // sosyal medya hesabı zorunlu.
  accountsJson: z.string().transform((val, ctx) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(val || "[]");
    } catch {
      ctx.addIssue({ code: "custom", message: "Sosyal medya hesap verisi okunamadı." });
      return z.NEVER;
    }
    const result = z
      .array(InfluencerAccountInputSchema)
      .min(1, { error: "En az bir sosyal medya hesabı ekleyin." })
      .safeParse(parsed);
    if (!result.success) {
      ctx.addIssue({
        code: "custom",
        message: "Hesaplardan biri eksik/hatalı — her hesapta platform ve kullanıcı adı gerekli.",
      });
      return z.NEVER;
    }
    return result.data;
  }),
});

export type InfluencerFormState =
  | { errors?: Record<string, string[]>; message?: string; success?: boolean }
  | undefined;

// Excel/CSV içe aktarma — bkz. lib/influencer-import-export.ts (dosyayı
// tarayıcıda satır dizisine çevirir) ve modules/influencer/actions.ts#
// bulkImportInfluencers (sunucu tarafında doğrulayıp kaydeder). Manuel form
// akışındaki InfluencerAccountInputSchema'dan farklı olarak platform ID değil
// SERBEST METİN platform adı taşır — dosyadaki "Platform" sütunu id değil ad
// içerir, sunucu tarafında ada göre eşleştirilir/gerekirse oluşturulur.
export const BulkImportAccountSchema = z.object({
  platformName: z.string().trim().default(""),
  username: z.string().trim().min(1),
  profileUrl: z.string().trim().default(""),
  followerCount: z.number().int().nonnegative().default(0),
});
export type BulkImportAccountInput = z.infer<typeof BulkImportAccountSchema>;

export const BulkImportRowSchema = z.object({
  firstName: z.string().trim().default(""),
  lastName: z.string().trim().default(""),
  email: z.string().trim().default(""),
  phone: z.string().trim().default(""),
  address: z.string().trim().default(""),
  accounts: z.array(BulkImportAccountSchema),
});
export type BulkImportRowInput = z.infer<typeof BulkImportRowSchema>;

export type BulkImportResult = {
  createdCount: number;
  errors: { row: number; message: string }[];
};
