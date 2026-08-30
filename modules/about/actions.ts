"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/modules/shared/dal";
import { logAudit } from "@/modules/shared/audit";
import {
  AboutContentSchema,
  TeamMemberSchema,
  type AboutContentFormState,
  type TeamMemberFormState,
} from "./schema";

const LOCALE = "tr"; // Faz 4'e kadar tek dil; alan şemada zaten hazır.

export async function getAboutContent() {
  return prisma.aboutContent.findUnique({ where: { locale: LOCALE } });
}

export async function getTeamMember(id: string) {
  return prisma.teamMember.findUnique({ where: { id } });
}

export async function listTeamMembers() {
  return prisma.teamMember.findMany({
    where: { locale: LOCALE },
    orderBy: { sortOrder: "asc" },
  });
}

export async function updateAboutContent(
  _prevState: AboutContentFormState,
  formData: FormData
): Promise<AboutContentFormState> {
  const session = await verifySession();

  const validated = AboutContentSchema.safeParse({
    heroTitle: formData.get("heroTitle"),
    heroSubtitle: formData.get("heroSubtitle"),
    aboutText: formData.get("aboutText"),
    missionText: formData.get("missionText"),
    visionText: formData.get("visionText"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const updated = await prisma.aboutContent.upsert({
    where: { locale: LOCALE },
    update: validated.data,
    create: { locale: LOCALE, ...validated.data },
  });

  await logAudit({
    actorId: session.userId,
    action: "UPDATE",
    entityType: "AboutContent",
    entityId: updated.id,
  });

  revalidatePath("/about");
  revalidatePath("/admin/about");
  return { success: true, message: "Kaydedildi." };
}

export async function createTeamMember(
  _prevState: TeamMemberFormState,
  formData: FormData
): Promise<TeamMemberFormState> {
  const session = await verifySession();

  const validated = TeamMemberSchema.safeParse({
    name: formData.get("name"),
    role: formData.get("role"),
    bio: formData.get("bio"),
    photoUrl: formData.get("photoUrl") ?? "",
    colorTheme: formData.get("colorTheme"),
    linkedinUrl: formData.get("linkedinUrl") ?? "",
    specialties: formData.get("specialties") ?? "",
    sortOrder: formData.get("sortOrder") ?? 0,
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const member = await prisma.teamMember.create({
    data: { locale: LOCALE, ...validated.data },
  });

  await logAudit({
    actorId: session.userId,
    action: "CREATE",
    entityType: "TeamMember",
    entityId: member.id,
  });

  revalidatePath("/about");
  revalidatePath("/admin/about");
  return { success: true };
}

export async function updateTeamMember(
  id: string,
  _prevState: TeamMemberFormState,
  formData: FormData
): Promise<TeamMemberFormState> {
  const session = await verifySession();

  const existing = await prisma.teamMember.findUnique({ where: { id } });
  if (!existing) {
    return { message: "Ekip üyesi bulunamadı." };
  }

  const validated = TeamMemberSchema.safeParse({
    name: formData.get("name"),
    role: formData.get("role"),
    bio: formData.get("bio"),
    photoUrl: formData.get("photoUrl") ?? "",
    colorTheme: formData.get("colorTheme"),
    linkedinUrl: formData.get("linkedinUrl") ?? "",
    specialties: formData.get("specialties") ?? "",
    sortOrder: formData.get("sortOrder") ?? 0,
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const data = { ...validated.data };

  // "Aynı data" ilkesi: bir kullanıcı hesabına bağlı ekip üyesinin isim/unvanı
  // formdan ne gönderilirse gönderilsin, Kullanıcılar panelindeki Ad Soyad/Görev
  // ile geçersiz kılınır — tek doğru kaynak Kullanıcılar paneli olur
  // (bkz. modules/users/actions.ts#updateUser, ters yönde senkronizasyon orada).
  if (existing.linkedUserId) {
    const linkedUser = await prisma.user.findUnique({ where: { id: existing.linkedUserId } });
    if (linkedUser) {
      data.name = linkedUser.name;
      data.role = linkedUser.title?.trim() || "Ekip Üyesi";
    }
  }

  await prisma.teamMember.update({ where: { id }, data });

  await logAudit({
    actorId: session.userId,
    action: "UPDATE",
    entityType: "TeamMember",
    entityId: id,
  });

  revalidatePath("/about");
  revalidatePath("/admin/about");
  return { success: true };
}

export async function deleteTeamMember(id: string) {
  const session = await verifySession();

  await prisma.teamMember.delete({ where: { id } });

  await logAudit({
    actorId: session.userId,
    action: "DELETE",
    entityType: "TeamMember",
    entityId: id,
  });

  revalidatePath("/about");
  revalidatePath("/admin/about");
}
