"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/modules/shared/dal";
import { logAudit } from "@/modules/shared/audit";
import {
  ClientMeetingSchema,
  ProposalSchema,
  ClientAgreementSchema,
  PaymentSchema,
  type ClientMeetingFormState,
  type ProposalFormState,
  type ClientAgreementFormState,
  type PaymentFormState,
} from "./schema";

function revalidateContact(id: string) {
  revalidatePath(`/admin/crm/${id}`);
}

/** Firma detay sayfası (/admin/crm/[id]) — kişi bilgisi + tüm CRM alt-kayıtları tek seferde. */
export async function getGuideContactDetail(id: string) {
  await verifySession();
  return prisma.guideContact.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
      relatedUser: { select: { id: true, name: true } },
      meetings: { orderBy: { occurredAt: "desc" }, include: { createdBy: { select: { name: true } } } },
      proposals: { orderBy: { sentAt: "desc" } },
      agreements: { orderBy: { createdAt: "desc" } },
      payments: { orderBy: { createdAt: "desc" } },
    },
  });
}

// ── Görüşme/Toplantı Notu ──────────────────────────────────

export async function createClientMeeting(
  contactId: string,
  _prevState: ClientMeetingFormState,
  formData: FormData
): Promise<ClientMeetingFormState> {
  const session = await verifySession();

  const validated = ClientMeetingSchema.safeParse({
    type: formData.get("type"),
    occurredAt: formData.get("occurredAt"),
    notes: formData.get("notes"),
  });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const meeting = await prisma.clientMeeting.create({
    data: { contactId, createdById: session.userId, ...validated.data },
  });

  await logAudit({ actorId: session.userId, action: "CREATE", entityType: "ClientMeeting", entityId: meeting.id });
  revalidateContact(contactId);
  return { success: true };
}

export async function updateClientMeeting(
  id: string,
  contactId: string,
  _prevState: ClientMeetingFormState,
  formData: FormData
): Promise<ClientMeetingFormState> {
  const session = await verifySession();

  const validated = ClientMeetingSchema.safeParse({
    type: formData.get("type"),
    occurredAt: formData.get("occurredAt"),
    notes: formData.get("notes"),
  });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  await prisma.clientMeeting.update({ where: { id }, data: validated.data });

  await logAudit({ actorId: session.userId, action: "UPDATE", entityType: "ClientMeeting", entityId: id });
  revalidateContact(contactId);
  return { success: true };
}

export async function deleteClientMeeting(id: string, contactId: string) {
  const session = await verifySession();
  await prisma.clientMeeting.delete({ where: { id } });
  await logAudit({ actorId: session.userId, action: "DELETE", entityType: "ClientMeeting", entityId: id });
  revalidateContact(contactId);
}

// ── Teklif ──────────────────────────────────────────────────

export async function createProposal(
  contactId: string,
  _prevState: ProposalFormState,
  formData: FormData
): Promise<ProposalFormState> {
  const session = await verifySession();

  const validated = ProposalSchema.safeParse({
    title: formData.get("title"),
    amount: formData.get("amount"),
    currency: formData.get("currency") || "TRY",
    status: formData.get("status") || "SENT",
    sentAt: formData.get("sentAt"),
    respondedAt: formData.get("respondedAt") ?? "",
    fileUrl: formData.get("fileUrl") ?? "",
    notes: formData.get("notes") ?? "",
  });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { fileUrl, notes, ...rest } = validated.data;
  const proposal = await prisma.proposal.create({
    data: { contactId, fileUrl: fileUrl || null, notes: notes || null, ...rest },
  });

  await logAudit({ actorId: session.userId, action: "CREATE", entityType: "Proposal", entityId: proposal.id });
  revalidateContact(contactId);
  return { success: true };
}

export async function updateProposal(
  id: string,
  contactId: string,
  _prevState: ProposalFormState,
  formData: FormData
): Promise<ProposalFormState> {
  const session = await verifySession();

  const validated = ProposalSchema.safeParse({
    title: formData.get("title"),
    amount: formData.get("amount"),
    currency: formData.get("currency") || "TRY",
    status: formData.get("status") || "SENT",
    sentAt: formData.get("sentAt"),
    respondedAt: formData.get("respondedAt") ?? "",
    fileUrl: formData.get("fileUrl") ?? "",
    notes: formData.get("notes") ?? "",
  });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { fileUrl, notes, ...rest } = validated.data;
  await prisma.proposal.update({ where: { id }, data: { fileUrl: fileUrl || null, notes: notes || null, ...rest } });

  await logAudit({ actorId: session.userId, action: "UPDATE", entityType: "Proposal", entityId: id });
  revalidateContact(contactId);
  return { success: true };
}

export async function deleteProposal(id: string, contactId: string) {
  const session = await verifySession();
  await prisma.proposal.delete({ where: { id } });
  await logAudit({ actorId: session.userId, action: "DELETE", entityType: "Proposal", entityId: id });
  revalidateContact(contactId);
}

// ── Sözleşme ────────────────────────────────────────────────

export async function createClientAgreement(
  contactId: string,
  _prevState: ClientAgreementFormState,
  formData: FormData
): Promise<ClientAgreementFormState> {
  const session = await verifySession();

  const validated = ClientAgreementSchema.safeParse({
    title: formData.get("title"),
    fileUrl: formData.get("fileUrl") ?? "",
    signedAt: formData.get("signedAt") ?? "",
    startDate: formData.get("startDate") ?? "",
    endDate: formData.get("endDate") ?? "",
    notes: formData.get("notes") ?? "",
  });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { fileUrl, notes, ...rest } = validated.data;
  const agreement = await prisma.clientAgreement.create({
    data: { contactId, fileUrl: fileUrl || null, notes: notes || null, ...rest },
  });

  await logAudit({ actorId: session.userId, action: "CREATE", entityType: "ClientAgreement", entityId: agreement.id });
  revalidateContact(contactId);
  return { success: true };
}

export async function updateClientAgreement(
  id: string,
  contactId: string,
  _prevState: ClientAgreementFormState,
  formData: FormData
): Promise<ClientAgreementFormState> {
  const session = await verifySession();

  const validated = ClientAgreementSchema.safeParse({
    title: formData.get("title"),
    fileUrl: formData.get("fileUrl") ?? "",
    signedAt: formData.get("signedAt") ?? "",
    startDate: formData.get("startDate") ?? "",
    endDate: formData.get("endDate") ?? "",
    notes: formData.get("notes") ?? "",
  });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { fileUrl, notes, ...rest } = validated.data;
  await prisma.clientAgreement.update({
    where: { id },
    data: { fileUrl: fileUrl || null, notes: notes || null, ...rest },
  });

  await logAudit({ actorId: session.userId, action: "UPDATE", entityType: "ClientAgreement", entityId: id });
  revalidateContact(contactId);
  return { success: true };
}

export async function deleteClientAgreement(id: string, contactId: string) {
  const session = await verifySession();
  await prisma.clientAgreement.delete({ where: { id } });
  await logAudit({ actorId: session.userId, action: "DELETE", entityType: "ClientAgreement", entityId: id });
  revalidateContact(contactId);
}

// ── Ödeme ───────────────────────────────────────────────────

export async function createPayment(
  contactId: string,
  _prevState: PaymentFormState,
  formData: FormData
): Promise<PaymentFormState> {
  const session = await verifySession();

  const validated = PaymentSchema.safeParse({
    amount: formData.get("amount"),
    currency: formData.get("currency") || "TRY",
    method: formData.get("method"),
    period: formData.get("period") || "ONE_TIME",
    dueDate: formData.get("dueDate") ?? "",
    paidAt: formData.get("paidAt") ?? "",
    notes: formData.get("notes") ?? "",
  });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { notes, ...rest } = validated.data;
  const payment = await prisma.payment.create({ data: { contactId, notes: notes || null, ...rest } });

  await logAudit({ actorId: session.userId, action: "CREATE", entityType: "Payment", entityId: payment.id });
  revalidateContact(contactId);
  return { success: true };
}

export async function updatePayment(
  id: string,
  contactId: string,
  _prevState: PaymentFormState,
  formData: FormData
): Promise<PaymentFormState> {
  const session = await verifySession();

  const validated = PaymentSchema.safeParse({
    amount: formData.get("amount"),
    currency: formData.get("currency") || "TRY",
    method: formData.get("method"),
    period: formData.get("period") || "ONE_TIME",
    dueDate: formData.get("dueDate") ?? "",
    paidAt: formData.get("paidAt") ?? "",
    notes: formData.get("notes") ?? "",
  });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { notes, ...rest } = validated.data;
  await prisma.payment.update({ where: { id }, data: { notes: notes || null, ...rest } });

  await logAudit({ actorId: session.userId, action: "UPDATE", entityType: "Payment", entityId: id });
  revalidateContact(contactId);
  return { success: true };
}

export async function deletePayment(id: string, contactId: string) {
  const session = await verifySession();
  await prisma.payment.delete({ where: { id } });
  await logAudit({ actorId: session.userId, action: "DELETE", entityType: "Payment", entityId: id });
  revalidateContact(contactId);
}
