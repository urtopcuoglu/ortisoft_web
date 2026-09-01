import { z } from "zod";
import type { MeetingType, ProposalStatus, PaymentMethod, PaymentPeriod } from "@/lib/generated/prisma/client";

// ─────────────────────────────────────────────────────────
// CRM alt-varlıkları — GuideContact'a ("Rehber") bağlı görüşme notu, teklif,
// sözleşme, ödeme. Admin paneli, SEO vb. validasyon gerekmiyor — kurallar
// minimal tutuldu (bkz. modules/guide/schema.ts ile aynı yaklaşım).
// ─────────────────────────────────────────────────────────

export const MEETING_TYPE_LABEL: Record<MeetingType, string> = {
  EMAIL: "E-posta",
  IN_PERSON: "Yüz Yüze",
  PHONE: "Telefon",
};
export const MEETING_TYPES = Object.keys(MEETING_TYPE_LABEL) as MeetingType[];

export const ClientMeetingSchema = z.object({
  type: z.enum(MEETING_TYPES as [MeetingType, ...MeetingType[]], { error: "Görüşme tipi seçin." }),
  occurredAt: z.coerce.date({ error: "Geçerli bir tarih girin." }),
  notes: z.string().trim().min(2, { error: "Not en az 2 karakter olmalı." }),
});

export type ClientMeetingFormState =
  | { errors?: Record<string, string[]>; message?: string; success?: boolean }
  | undefined;

export const PROPOSAL_STATUS_LABEL: Record<ProposalStatus, string> = {
  SENT: "Gönderildi",
  ACCEPTED: "Kabul Edildi",
  REJECTED: "Reddedildi",
  EXPIRED: "Süresi Doldu",
};
export const PROPOSAL_STATUSES = Object.keys(PROPOSAL_STATUS_LABEL) as ProposalStatus[];

export const ProposalSchema = z.object({
  title: z.string().trim().min(2, { error: "Başlık en az 2 karakter olmalı." }),
  amount: z.coerce.number().nonnegative({ error: "Tutar 0 veya üzeri olmalı." }),
  currency: z.string().trim().min(1).default("TRY"),
  status: z.enum(PROPOSAL_STATUSES as [ProposalStatus, ...ProposalStatus[]]).default("SENT"),
  sentAt: z.coerce.date({ error: "Geçerli bir tarih girin." }),
  respondedAt: z.preprocess((v) => (v === "" ? undefined : v), z.coerce.date().optional()),
  fileUrl: z.union([z.url({ error: "Geçerli bir link girin." }), z.literal("")]).optional(),
  notes: z.string().trim().optional(),
});

export type ProposalFormState =
  | { errors?: Record<string, string[]>; message?: string; success?: boolean }
  | undefined;

export const ClientAgreementSchema = z.object({
  title: z.string().trim().min(2, { error: "Başlık en az 2 karakter olmalı." }),
  fileUrl: z.union([z.url({ error: "Geçerli bir link girin." }), z.literal("")]).optional(),
  signedAt: z.preprocess((v) => (v === "" ? undefined : v), z.coerce.date().optional()),
  startDate: z.preprocess((v) => (v === "" ? undefined : v), z.coerce.date().optional()),
  endDate: z.preprocess((v) => (v === "" ? undefined : v), z.coerce.date().optional()),
  notes: z.string().trim().optional(),
});

export type ClientAgreementFormState =
  | { errors?: Record<string, string[]>; message?: string; success?: boolean }
  | undefined;

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  CASH: "Nakit",
  CARD: "Kart",
  BANK_TRANSFER: "Havale/EFT",
};
export const PAYMENT_METHODS = Object.keys(PAYMENT_METHOD_LABEL) as PaymentMethod[];

export const PAYMENT_PERIOD_LABEL: Record<PaymentPeriod, string> = {
  ONE_TIME: "Tek Seferlik",
  MONTHLY: "Aylık",
  QUARTERLY: "3 Aylık",
  YEARLY: "Yıllık",
};
export const PAYMENT_PERIODS = Object.keys(PAYMENT_PERIOD_LABEL) as PaymentPeriod[];

export const PaymentSchema = z.object({
  amount: z.coerce.number().nonnegative({ error: "Tutar 0 veya üzeri olmalı." }),
  currency: z.string().trim().min(1).default("TRY"),
  method: z.enum(PAYMENT_METHODS as [PaymentMethod, ...PaymentMethod[]], { error: "Ödeme tipi seçin." }),
  period: z.enum(PAYMENT_PERIODS as [PaymentPeriod, ...PaymentPeriod[]]).default("ONE_TIME"),
  dueDate: z.preprocess((v) => (v === "" ? undefined : v), z.coerce.date().optional()),
  paidAt: z.preprocess((v) => (v === "" ? undefined : v), z.coerce.date().optional()),
  notes: z.string().trim().optional(),
});

export type PaymentFormState =
  | { errors?: Record<string, string[]>; message?: string; success?: boolean }
  | undefined;
