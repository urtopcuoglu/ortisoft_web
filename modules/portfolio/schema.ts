import { z } from "zod";
import type { PortfolioChannel } from "@/lib/generated/prisma/client";

// ─────────────────────────────────────────────────────────
// Pazarlama Portföy Yönetimi — admin paneli, bu yüzden validasyon minimal
// tutuldu (GuideContact/Task modülleriyle aynı yaklaşım). Kanban DEĞİL: tablo
// + kanal başına temas sayacı + ayrı detay sayfası (bkz. prisma/schema.prisma
// dosya başı açıklaması).
// ─────────────────────────────────────────────────────────

export const PORTFOLIO_CHANNEL_LABEL: Record<PortfolioChannel, string> = {
  MESAJ: "Mesaj",
  MAIL: "Mail",
  TELEFON: "Telefon",
  YERINDE_ZIYARET: "Yerinde Ziyaret",
};
export const PORTFOLIO_CHANNELS = Object.keys(PORTFOLIO_CHANNEL_LABEL) as PortfolioChannel[];

// Statü dropdown'ındaki "+ yeni durum ekle" sentinel değeri — GuideCategory'deki
// NEW_CATEGORY_VALUE ile aynı desen (bkz. modules/portfolio/actions.ts#resolveStatusId).
export const NEW_PORTFOLIO_STATUS_VALUE = "__new_portfolio_status__";

// Dosya yükleme — CV yüklemeyle (modules/messages/schema.ts) aynı desen,
// farklı sınır/tipler: 20MB, ofis belgeleri (görsel/CV formatı yok).
export const PORTFOLIO_FILE_MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20MB
export const PORTFOLIO_FILE_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "text/csv",
] as const;
export const PORTFOLIO_FILE_ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv"] as const;

export type PortfolioFormState =
  | { errors?: Record<string, string[]>; message?: string; success?: boolean }
  | undefined;

// ── Müşteri (portföy kaydı) ──────────────────────────────────
// Sadece companyName/authorizedPerson zorunlu — gerisi (hizmet, iletişim
// bilgileri) opsiyonel, bu panelin düşük-sürtünmeli form felsefesiyle
// tutarlı (bkz. Influencer/GuideContact.website gibi opsiyonel alanlar).
// contactEmail/contactPhone yetkili kişinin KENDİ bilgisi — kullanıcı isteği
// gereği doldurulması zorunlu DEĞİL.
export const PortfolioCustomerSchema = z.object({
  companyName: z.string().trim().min(2, { error: "Firma adı en az 2 karakter olmalı." }),
  authorizedPerson: z.string().trim().min(2, { error: "Yetkili adı en az 2 karakter olmalı." }),
  serviceId: z.string().trim().default(""),
  description: z.string().trim().default(""),
  address: z.string().trim().default(""),
  companyEmail: z.union([z.email({ error: "Geçerli bir e-posta girin." }), z.literal("")]).default(""),
  companyPhone: z.string().trim().default(""),
  contactEmail: z.union([z.email({ error: "Geçerli bir e-posta girin." }), z.literal("")]).default(""),
  contactPhone: z.string().trim().default(""),
});

// ── Temas kaydı ("+" ile tablo hücresinden loglanır) ─────────
// customerId/channel formda YOK — hangi hücrenin "+"ı tıklandıysa oradan
// (server action bind ile) gelir, bu yüzden burada doğrulanmıyor.
export const PortfolioContactSchema = z.object({
  contactedAt: z.coerce.date({ error: "Geçerli bir tarih girin." }),
  notes: z.string().trim().min(2, { error: "Toplantı notları en az 2 karakter olmalı." }),
  remarks: z.string().trim().default(""),
});
