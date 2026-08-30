"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin, CV_BUCKET } from "@/lib/supabase-admin";
import { verifySession } from "@/modules/shared/dal";
import { logAudit } from "@/modules/shared/audit";
import {
  ContactFormSchema,
  ReplySchema,
  MESSAGE_STATUSES,
  CV_MAX_SIZE_BYTES,
  CV_ALLOWED_MIME_TYPES,
  type ContactFormState,
  type ReplyFormState,
  type MessageStatusValue,
} from "./schema";

function extensionFor(mimeType: string) {
  switch (mimeType) {
    case "application/pdf":
      return ".pdf";
    case "image/png":
      return ".png";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return ".docx";
    default:
      return "";
  }
}

/**
 * PUBLIC Server Action — iletişim formundan çağrılır, oturum GEREKTİRMEZ.
 * Herkes çağırabileceği için girdi doğrulaması özellikle sıkı tutulur.
 */
export async function submitContactMessage(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const validated = ContactFormSchema.safeParse({
    purpose: formData.get("purpose"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    company: formData.get("company") ?? "",
    service: formData.get("service") ?? "",
    message: formData.get("message") ?? "",
    kvkkConsent: formData.get("kvkkConsent"),
    website: formData.get("website") ?? "",
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  // Honeypot: bu alan sadece botlar tarafından doldurulur — sessizce "başarılı"
  // gibi davranıp hiçbir şey kaydetmiyoruz (botu bilgilendirmemek için).
  if (validated.data.website) {
    return { success: true };
  }

  const { purpose, name, email, phone, company, service, message } = validated.data;

  let cvFilePath: string | null = null;
  let cvFileName: string | null = null;

  if (purpose === "CV") {
    const file = formData.get("cvFile");

    if (!(file instanceof File) || file.size === 0) {
      return { errors: { cvFile: ["Lütfen bir CV dosyası yükleyin."] } };
    }
    if (file.size > CV_MAX_SIZE_BYTES) {
      return { errors: { cvFile: ["Dosya boyutu en fazla 10MB olabilir."] } };
    }
    if (!CV_ALLOWED_MIME_TYPES.includes(file.type as (typeof CV_ALLOWED_MIME_TYPES)[number])) {
      return { errors: { cvFile: ["Sadece PDF, PNG veya DOCX dosyaları kabul edilir."] } };
    }

    const path = `cv/${crypto.randomUUID()}${extensionFor(file.type)}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from(CV_BUCKET)
      .upload(path, file, { contentType: file.type });

    if (uploadError) {
      console.error("CV yükleme hatası:", uploadError);
      return { errors: { cvFile: ["Dosya yüklenirken bir hata oluştu, lütfen tekrar deneyin."] } };
    }

    cvFilePath = path;
    cvFileName = file.name;
  }

  await prisma.contactMessage.create({
    data: {
      purpose,
      name,
      email,
      phone: phone || null,
      company: company || null,
      service: service || null,
      message: message || "",
      kvkkConsent: true,
      cvFilePath,
      cvFileName,
    },
  });

  return { success: true, message: "Mesajınız alındı! En kısa sürede size dönüş yapacağız." };
}

/** Admin: tüm mesajlar, en yeniden eskiye. */
export async function listMessages() {
  return prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });
}

/** Admin: sadece CV başvuruları (Kariyer > Aday CV'leri sayfası için). */
export async function listCvSubmissions() {
  return prisma.contactMessage.findMany({
    where: { purpose: "CV" },
    orderBy: { createdAt: "desc" },
  });
}

export async function getMessage(id: string) {
  return prisma.contactMessage.findUnique({
    where: { id },
    include: {
      replies: {
        orderBy: { sentAt: "asc" },
        include: { sentBy: { select: { name: true, email: true } } },
      },
    },
  });
}

/** Admin: bir CV'yi kısa ömürlü imzalı bağlantıyla indirmek için. */
export async function getCvSignedUrl(messageId: string) {
  await verifySession();

  const msg = await prisma.contactMessage.findUnique({ where: { id: messageId } });
  if (!msg?.cvFilePath) return null;

  const { data, error } = await supabaseAdmin.storage
    .from(CV_BUCKET)
    .createSignedUrl(msg.cvFilePath, 60 * 5, {
      download: msg.cvFileName ?? undefined,
    });

  if (error) {
    console.error("İmzalı URL oluşturma hatası:", error);
    return null;
  }
  return data.signedUrl;
}

export async function updateMessageStatus(id: string, status: MessageStatusValue) {
  const session = await verifySession();

  if (!MESSAGE_STATUSES.includes(status)) {
    throw new Error("Geçersiz durum.");
  }

  await prisma.contactMessage.update({ where: { id }, data: { status } });

  await logAudit({
    actorId: session.userId,
    action: "UPDATE",
    entityType: "ContactMessage",
    entityId: id,
    diff: { status },
  });

  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${id}`);
}

export async function createReply(
  messageId: string,
  _prevState: ReplyFormState,
  formData: FormData
): Promise<ReplyFormState> {
  const session = await verifySession();

  const validated = ReplySchema.safeParse({ body: formData.get("body") });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  await prisma.$transaction([
    prisma.messageReply.create({
      data: { messageId, body: validated.data.body, sentById: session.userId },
    }),
    prisma.contactMessage.update({
      where: { id: messageId },
      data: { status: "REPLIED" },
    }),
  ]);

  await logAudit({
    actorId: session.userId,
    action: "CREATE",
    entityType: "MessageReply",
    entityId: messageId,
  });

  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${messageId}`);
  return { success: true, replyBody: validated.data.body };
}

export async function deleteMessage(id: string) {
  const session = await verifySession();

  const msg = await prisma.contactMessage.findUnique({ where: { id } });

  await prisma.contactMessage.delete({ where: { id } });

  // Depolamada yetim dosya bırakmamak için CV varsa onu da sil (best-effort).
  if (msg?.cvFilePath) {
    await supabaseAdmin.storage.from(CV_BUCKET).remove([msg.cvFilePath]).catch((err) => {
      console.error("CV dosyası silinemedi:", err);
    });
  }

  await logAudit({
    actorId: session.userId,
    action: "DELETE",
    entityType: "ContactMessage",
    entityId: id,
  });

  revalidatePath("/admin/messages");
  revalidatePath("/admin/career/cvs");
  redirect("/admin/messages");
}
