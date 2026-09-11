"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Prisma, type PortfolioChannel } from "@/lib/generated/prisma/client";
import { supabaseAdmin, PORTFOLIO_BUCKET } from "@/lib/supabase-admin";
import { verifySession } from "@/modules/shared/dal";
import { logAudit } from "@/modules/shared/audit";
import {
  PortfolioCustomerSchema,
  PortfolioContactSchema,
  PORTFOLIO_CHANNELS,
  NEW_PORTFOLIO_STATUS_VALUE,
  PORTFOLIO_FILE_MAX_SIZE_BYTES,
  PORTFOLIO_FILE_ALLOWED_MIME_TYPES,
  type PortfolioFormState,
} from "./schema";

const PORTFOLIO_PATH = "/admin/crm";

function extensionFor(mimeType: string) {
  switch (mimeType) {
    case "application/pdf":
      return ".pdf";
    case "application/msword":
      return ".doc";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return ".docx";
    case "application/vnd.ms-excel":
      return ".xls";
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return ".xlsx";
    case "text/csv":
      return ".csv";
    default:
      return "";
  }
}

/**
 * Dosya alanı formda opsiyonel — hiç dosya seçilmediyse (create'te normal,
 * update'te "mevcut dosyayı koru" anlamına gelir) `undefined` döner. Bir
 * dosya seçilmişse boyut/tip doğrulanıp yüklenir (CV yüklemeyle aynı desen,
 * bkz. modules/messages/actions.ts#submitContactMessage).
 */
async function uploadPortfolioFileIfPresent(
  formData: FormData
): Promise<{ filePath: string; fileName: string } | { error: string } | undefined> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return undefined;

  if (file.size > PORTFOLIO_FILE_MAX_SIZE_BYTES) {
    return { error: "Dosya boyutu en fazla 20MB olabilir." };
  }
  if (!PORTFOLIO_FILE_ALLOWED_MIME_TYPES.includes(file.type as (typeof PORTFOLIO_FILE_ALLOWED_MIME_TYPES)[number])) {
    return { error: "Sadece PDF, DOC, DOCX, XLS, XLSX veya CSV dosyaları kabul edilir." };
  }

  const path = `portfolio/${crypto.randomUUID()}${extensionFor(file.type)}`;
  const { error: uploadError } = await supabaseAdmin.storage
    .from(PORTFOLIO_BUCKET)
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    console.error("Portföy dosyası yükleme hatası:", uploadError);
    return { error: "Dosya yüklenirken bir hata oluştu, lütfen tekrar deneyin." };
  }

  return { filePath: path, fileName: file.name };
}

async function removePortfolioFile(filePath: string) {
  await supabaseAdmin.storage
    .from(PORTFOLIO_BUCKET)
    .remove([filePath])
    .catch((err) => {
      console.error("Portföy dosyası silinemedi:", err);
    });
}

// ─────────────────────────────────────────────────────────
// Okuma
// ─────────────────────────────────────────────────────────

/** Tablo görünümü — her müşteri için kanal başına temas sayısı önceden hesaplanır. */
export async function listPortfolioCustomers() {
  await verifySession();
  const customers = await prisma.portfolioCustomer.findMany({
    orderBy: { recordDate: "desc" },
    include: {
      service: { select: { id: true, title: true } },
      currentStatus: { select: { id: true, name: true } },
      contacts: { select: { channel: true } },
    },
  });

  return customers.map((c) => ({
    ...c,
    channelCounts: PORTFOLIO_CHANNELS.reduce(
      (acc, ch) => {
        acc[ch] = c.contacts.filter((x) => x.channel === ch).length;
        return acc;
      },
      {} as Record<PortfolioChannel, number>
    ),
  }));
}

/** Detay sayfası — müşteri + tüm kanallardaki temas geçmişi kronolojik. */
export async function getPortfolioCustomer(id: string) {
  await verifySession();
  return prisma.portfolioCustomer.findUnique({
    where: { id },
    include: {
      service: { select: { id: true, title: true } },
      currentStatus: { select: { id: true, name: true } },
      contacts: {
        orderBy: { contactedAt: "desc" },
        include: {
          status: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true } },
        },
      },
    },
  });
}

export async function listPortfolioContactStatuses() {
  await verifySession();
  return prisma.portfolioContactStatus.findMany({ orderBy: { name: "asc" } });
}

/** İndirme route'u için — bkz. app/(admin)/admin/(protected)/crm/portfolio/[id]/download/route.ts. */
export async function getPortfolioSignedFileUrl(id: string) {
  await verifySession();

  const customer = await prisma.portfolioCustomer.findUnique({ where: { id } });
  if (!customer?.filePath) return null;

  const { data, error } = await supabaseAdmin.storage
    .from(PORTFOLIO_BUCKET)
    .createSignedUrl(customer.filePath, 60 * 5, { download: customer.fileName ?? undefined });

  if (error) {
    console.error("İmzalı URL oluşturma hatası:", error);
    return null;
  }
  return data.signedUrl;
}

// ─────────────────────────────────────────────────────────
// Statü (resolve-or-create, GuideCategory ile aynı desen)
// ─────────────────────────────────────────────────────────

async function resolveStatusIdByName(name: string): Promise<string> {
  const trimmed = name.trim();
  const existing = await prisma.portfolioContactStatus.findFirst({
    where: { name: { equals: trimmed, mode: "insensitive" } },
  });
  if (existing) return existing.id;
  const created = await prisma.portfolioContactStatus.create({ data: { name: trimmed } });
  return created.id;
}

async function resolveStatusId(formData: FormData): Promise<{ id: string | null } | { error: string }> {
  const statusId = String(formData.get("statusId") ?? "");

  if (statusId === NEW_PORTFOLIO_STATUS_VALUE) {
    const name = String(formData.get("newStatusName") ?? "").trim();
    if (name.length < 2) {
      return { error: "Yeni durum adı en az 2 karakter olmalı." };
    }
    return { id: await resolveStatusIdByName(name) };
  }

  return { id: statusId || null };
}

// ─────────────────────────────────────────────────────────
// Müşteri
// ─────────────────────────────────────────────────────────

export async function createPortfolioCustomer(
  _prevState: PortfolioFormState,
  formData: FormData
): Promise<PortfolioFormState> {
  const session = await verifySession();

  const validated = PortfolioCustomerSchema.safeParse({
    companyName: formData.get("companyName"),
    authorizedPerson: formData.get("authorizedPerson"),
    serviceId: formData.get("serviceId") ?? "",
    description: formData.get("description") ?? "",
    address: formData.get("address") ?? "",
    companyEmail: formData.get("companyEmail") ?? "",
    companyPhone: formData.get("companyPhone") ?? "",
    contactEmail: formData.get("contactEmail") ?? "",
    contactPhone: formData.get("contactPhone") ?? "",
  });
  if (!validated.success) return { errors: validated.error.flatten().fieldErrors };

  const fileResult = await uploadPortfolioFileIfPresent(formData);
  if (fileResult && "error" in fileResult) return { errors: { file: [fileResult.error] } };

  const sourceMessageId = String(formData.get("sourceMessageId") ?? "") || null;

  const customer = await prisma.portfolioCustomer.create({
    data: {
      companyName: validated.data.companyName,
      authorizedPerson: validated.data.authorizedPerson,
      serviceId: validated.data.serviceId || null,
      description: validated.data.description || null,
      address: validated.data.address || null,
      companyEmail: validated.data.companyEmail || null,
      companyPhone: validated.data.companyPhone || null,
      contactEmail: validated.data.contactEmail || null,
      contactPhone: validated.data.contactPhone || null,
      filePath: fileResult?.filePath,
      fileName: fileResult?.fileName,
    },
  });

  if (sourceMessageId) {
    await prisma.contactMessage.update({
      where: { id: sourceMessageId },
      data: { portfolioCustomerId: customer.id },
    });
  }

  await logAudit({ actorId: session.userId, action: "CREATE", entityType: "PortfolioCustomer", entityId: customer.id });

  revalidatePath(PORTFOLIO_PATH);
  if (sourceMessageId) revalidatePath(`/admin/messages/${sourceMessageId}`);
  return { success: true, message: "Müşteri eklendi." };
}

export async function updatePortfolioCustomer(
  id: string,
  _prevState: PortfolioFormState,
  formData: FormData
): Promise<PortfolioFormState> {
  const session = await verifySession();

  const validated = PortfolioCustomerSchema.safeParse({
    companyName: formData.get("companyName"),
    authorizedPerson: formData.get("authorizedPerson"),
    serviceId: formData.get("serviceId") ?? "",
    description: formData.get("description") ?? "",
    address: formData.get("address") ?? "",
    companyEmail: formData.get("companyEmail") ?? "",
    companyPhone: formData.get("companyPhone") ?? "",
    contactEmail: formData.get("contactEmail") ?? "",
    contactPhone: formData.get("contactPhone") ?? "",
  });
  if (!validated.success) return { errors: validated.error.flatten().fieldErrors };

  const fileResult = await uploadPortfolioFileIfPresent(formData);
  if (fileResult && "error" in fileResult) return { errors: { file: [fileResult.error] } };

  const existing = await prisma.portfolioCustomer.findUnique({ where: { id }, select: { filePath: true } });

  await prisma.portfolioCustomer.update({
    where: { id },
    data: {
      companyName: validated.data.companyName,
      authorizedPerson: validated.data.authorizedPerson,
      serviceId: validated.data.serviceId || null,
      description: validated.data.description || null,
      address: validated.data.address || null,
      companyEmail: validated.data.companyEmail || null,
      companyPhone: validated.data.companyPhone || null,
      contactEmail: validated.data.contactEmail || null,
      contactPhone: validated.data.contactPhone || null,
      // Yeni dosya yüklenmediyse mevcut dosya korunur (undefined = dokunma).
      ...(fileResult ? { filePath: fileResult.filePath, fileName: fileResult.fileName } : {}),
    },
  });

  // Eski dosya yeni biriyle değiştirildiyse, depolamada yetim bırakmamak için sil.
  if (fileResult && existing?.filePath) {
    await removePortfolioFile(existing.filePath);
  }

  await logAudit({ actorId: session.userId, action: "UPDATE", entityType: "PortfolioCustomer", entityId: id });

  revalidatePath(PORTFOLIO_PATH);
  revalidatePath(`/admin/crm/portfolio/${id}`);
  return { success: true, message: "Kaydedildi." };
}

/** Restrict-catch — GuideContact'taki deleteGuideContact ile aynı desen. */
export async function deletePortfolioCustomer(id: string) {
  const session = await verifySession();

  const existing = await prisma.portfolioCustomer.findUnique({ where: { id }, select: { filePath: true } });

  try {
    await prisma.portfolioCustomer.delete({ where: { id } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      throw new Error(
        "Bu müşteri silinemedi — altında temas kaydı var. Önce onları silin ya da bu müşteriyi Pasif yapın."
      );
    }
    throw err;
  }

  if (existing?.filePath) await removePortfolioFile(existing.filePath);

  await logAudit({ actorId: session.userId, action: "DELETE", entityType: "PortfolioCustomer", entityId: id });
  revalidatePath(PORTFOLIO_PATH);
}

/** Aktif/Pasif switch — direkt çağrı, form değil (moveTask/toggleSubtask deseni). */
export async function setPortfolioCustomerActive(id: string, isActive: boolean) {
  const session = await verifySession();
  await prisma.portfolioCustomer.update({ where: { id }, data: { isActive } });
  await logAudit({
    actorId: session.userId,
    action: "UPDATE",
    entityType: "PortfolioCustomer",
    entityId: id,
    diff: { isActive },
  });
  revalidatePath(PORTFOLIO_PATH);
  revalidatePath(`/admin/crm/portfolio/${id}`);
}

/**
 * Tek yönlü "Olumsuz Statüsüne Çek" — currentStatusId'yi "Olumsuz"a çeker VE
 * isActive'i false yapar (tek işlemde, kullanıcı isteği gereği). İdempotent:
 * tekrar basmak ya da reaktive ettikten sonra basmak sorun çıkarmaz.
 * Reaktivasyon (Aktif/Pasif switch) currentStatusId'yi TEMİZLEMEZ — iki
 * kontrol kasıtlı olarak ayrık (bkz. prisma/schema.prisma dosya başı notu).
 */
export async function markPortfolioCustomerNegative(id: string) {
  const session = await verifySession();
  const negativeStatusId = await resolveStatusIdByName("Olumsuz");

  await prisma.portfolioCustomer.update({
    where: { id },
    data: { currentStatusId: negativeStatusId, isActive: false },
  });

  await logAudit({
    actorId: session.userId,
    action: "UPDATE",
    entityType: "PortfolioCustomer",
    entityId: id,
    diff: { currentStatusId: negativeStatusId, isActive: false },
  });

  revalidatePath(PORTFOLIO_PATH);
  revalidatePath(`/admin/crm/portfolio/${id}`);
}

// ─────────────────────────────────────────────────────────
// Temas kaydı — tablo hücresindeki "+" ile loglanır, müşteri+kanal props'tan
// (bind) gelir, modalde seçici yok.
// ─────────────────────────────────────────────────────────

export async function createPortfolioContact(
  customerId: string,
  channel: PortfolioChannel,
  _prevState: PortfolioFormState,
  formData: FormData
): Promise<PortfolioFormState> {
  const session = await verifySession();

  const statusResult = await resolveStatusId(formData);
  if ("error" in statusResult) return { errors: { statusId: [statusResult.error] } };

  const validated = PortfolioContactSchema.safeParse({
    contactedAt: formData.get("contactedAt"),
    notes: formData.get("notes"),
    remarks: formData.get("remarks") ?? "",
  });
  if (!validated.success) return { errors: validated.error.flatten().fieldErrors };

  const contact = await prisma.portfolioContact.create({
    data: {
      customerId,
      channel,
      contactedAt: validated.data.contactedAt,
      notes: validated.data.notes,
      remarks: validated.data.remarks || null,
      statusId: statusResult.id,
      createdById: session.userId,
    },
  });

  await logAudit({
    actorId: session.userId,
    action: "CREATE",
    entityType: "PortfolioContact",
    entityId: contact.id,
    diff: { customerId, channel },
  });

  revalidatePath(PORTFOLIO_PATH);
  revalidatePath(`/admin/crm/portfolio/${customerId}`);
  return { success: true, message: "Temas kaydı eklendi." };
}

/** Hard delete — geçmiş kaydı düzeltmek için (MeetingsPanel'deki delete-with-confirm deseni). */
export async function deletePortfolioContact(id: string) {
  const session = await verifySession();
  const contact = await prisma.portfolioContact.delete({ where: { id } });
  await logAudit({
    actorId: session.userId,
    action: "DELETE",
    entityType: "PortfolioContact",
    entityId: id,
    diff: { customerId: contact.customerId },
  });
  revalidatePath(PORTFOLIO_PATH);
  revalidatePath(`/admin/crm/portfolio/${contact.customerId}`);
}
