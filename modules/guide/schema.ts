import { z } from "zod";
import type { GuideRelationType } from "@/lib/generated/prisma/client";

// Kategori dropdown'ındaki "yeni kategori ekle" satırının sentinel değeri —
// hem select'te (components/admin/GuideContactModal.tsx) hem de sunucu
// tarafında (modules/guide/actions.ts#resolveCategoryId) kullanılır.
export const NEW_CATEGORY_VALUE = "__new__";

// İlişki türü — kullanıcı tarafından sabit tanımlanmış 8 değer (bkz. prisma/schema.prisma).
// Kategori'nin aksine burası dropdown'dan büyütülemez.
export const GUIDE_RELATION_TYPE_LABEL: Record<GuideRelationType, string> = {
  COZUM_ORTAGI: "Çözüm Ortağı",
  TEDARIKCI: "Tedarikçi",
  POTANSIYEL_MUSTERI: "Potansiyel Müşteri",
  AKTIF_MUSTERI: "Aktif Müşteri",
  PASIF_MUSTERI: "Pasif Müşteri",
  YETKILI_TEKNIK_SERVIS: "Yetkili - Teknik Servis",
  MALI_MUHASEBE: "Mali - Muhasebe",
  DESTEK: "Destek",
};

export const GUIDE_RELATION_TYPES = Object.keys(GUIDE_RELATION_TYPE_LABEL) as GuideRelationType[];

// categoryId/newCategoryName ayrı (modules/guide/actions.ts#resolveCategoryId
// içinde önce kategori çözülüp DB'ye yazılır, sonra geri kalan alanlar bu
// şemayla doğrulanır) — admin paneli, SEO vb. validasyon istenmedi, bu yüzden
// kurallar minimal tutuldu.
export const GuideContactSchema = z.object({
  companyName: z.string().trim().min(2, { error: "Firma adı en az 2 karakter olmalı." }),
  authorizedPerson: z.string().trim().min(2, { error: "Yetkili adı en az 2 karakter olmalı." }),
  phone: z.string().trim().min(5, { error: "Telefon en az 5 karakter olmalı." }),
  address: z.string().trim().optional(),
  email: z.email({ error: "Geçerli bir e-posta girin." }),
  website: z
    .union([z.url({ error: "Geçerli bir link girin." }), z.literal("")])
    .optional(),
  relatedUserId: z.string().trim().optional(),
  relationType: z.enum(GUIDE_RELATION_TYPES as [GuideRelationType, ...GuideRelationType[]], {
    error: "İlişki türü seçin.",
  }),
});

export type GuideContactFormState =
  | { errors?: Record<string, string[]>; message?: string; success?: boolean }
  | undefined;
