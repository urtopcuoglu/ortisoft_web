"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { sendEmail } from "@/lib/resend";
import { verifyAdminSession } from "@/modules/shared/dal";
import { logAudit } from "@/modules/shared/audit";
import {
  CreateUserSchema,
  UpdateUserSchema,
  USER_ROLE_LABEL,
  type CreateUserFormState,
  type UpdateUserFormState,
} from "./schema";

const LOCALE = "tr";
const SITE_URL = "https://ortisoft.com.tr";

/**
 * Bu modülün tamamı verifyAdminSession() ile korunur — personel bilgileri,
 * rol atama ve şifre sıfırlama sadece ADMIN rolündeki hesaplara açık
 * (bkz. modules/shared/dal.ts, plan dokümanı Bölüm 3.3).
 */

export async function listUsers() {
  await verifyAdminSession();
  return prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      title: true,
      department: true,
      personalPhone: true,
      companyPhone: true,
      createdAt: true,
      teamMember: { select: { id: true } },
    },
  });
}

export async function getUser(id: string) {
  await verifyAdminSession();
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      title: true,
      department: true,
      personalPhone: true,
      companyPhone: true,
      teamMember: { select: { id: true } },
    },
  });
}

/** "Ekibe ekle" işaretlenince, mevcut About > Ekip listesine bağlı bir kayıt oluşturur. */
async function createTeamMemberForUser(user: { id: string; name: string; title: string | null }) {
  const count = await prisma.teamMember.count({ where: { locale: LOCALE } });
  return prisma.teamMember.create({
    data: {
      locale: LOCALE,
      name: user.name,
      role: user.title?.trim() || "Ekip Üyesi",
      bio: "Detaylar yakında eklenecek.",
      colorTheme: "blue",
      specialties: [],
      sortOrder: count,
      linkedUserId: user.id,
    },
  });
}

export async function createUser(
  _prevState: CreateUserFormState,
  formData: FormData
): Promise<CreateUserFormState> {
  const session = await verifyAdminSession();

  const validated = CreateUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    role: formData.get("role"),
    title: formData.get("title") ?? "",
    department: formData.get("department") ?? "",
    personalPhone: formData.get("personalPhone") ?? "",
    companyPhone: formData.get("companyPhone") ?? "",
    addToTeam: formData.get("addToTeam") ?? undefined,
    sendCredentials: formData.get("sendCredentials") ?? undefined,
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const existing = await prisma.user.findUnique({ where: { email: validated.data.email } });
  if (existing) {
    return { errors: { email: ["Bu e-posta adresi zaten kayıtlı."] } };
  }

  const passwordHash = await hashPassword(validated.data.password);

  const user = await prisma.user.create({
    data: {
      name: validated.data.name,
      email: validated.data.email,
      passwordHash,
      role: validated.data.role,
      title: validated.data.title || null,
      department: validated.data.department || null,
      personalPhone: validated.data.personalPhone || null,
      companyPhone: validated.data.companyPhone || null,
    },
  });

  if (validated.data.addToTeam) {
    await createTeamMemberForUser(user);
  }

  // Giriş bilgilerini şifre AÇIK METİN olarak e-postayla gönderir — RESEND_API_KEY
  // tanımlı değilse veya gönderim başarısız olursa sessizce false döner, admin
  // formda bunu görüp şifreyi manuel iletebilir (bkz. modules/messages/actions.ts
  // createReply() ile aynı tembel/geriye-düşen desen).
  let credentialsEmailSent = false;
  if (validated.data.sendCredentials) {
    const loginUrl = `${SITE_URL}/admin/login`;
    const result = await sendEmail({
      to: user.email,
      subject: "Ortisoft Admin Paneli — Hesabınız Oluşturuldu",
      html:
        `<p>Merhaba ${user.name},</p>` +
        `<p>Ortisoft admin panelinde sizin için bir hesap oluşturuldu.</p>` +
        `<p><strong>Giriş bilgileriniz:</strong><br/>` +
        `E-posta: ${user.email}<br/>` +
        `Şifre: ${validated.data.password}<br/>` +
        `Rol: ${USER_ROLE_LABEL[user.role]}</p>` +
        `<p><a href="${loginUrl}">${loginUrl}</a> adresinden giriş yapabilirsiniz. ` +
        `Güvenliğiniz için ilk girişten sonra Ayarlar sayfasından şifrenizi değiştirmenizi öneririz.</p>`,
    });
    credentialsEmailSent = result.sent;
  }

  await logAudit({
    actorId: session.userId,
    action: "CREATE",
    entityType: "User",
    entityId: user.id,
    diff: {
      email: user.email,
      role: user.role,
      addedToTeam: !!validated.data.addToTeam,
      credentialsEmailSent,
    },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/about");
  revalidatePath("/about");
  return {
    success: true,
    message: "Kullanıcı oluşturuldu.",
    credentialsEmailSent: validated.data.sendCredentials ? credentialsEmailSent : undefined,
  };
}

/** Son admin sayısını kontrol eder — self-lockout / erişim kaybını önlemek için. */
async function countAdmins(excludeId?: string) {
  return prisma.user.count({
    where: { role: "ADMIN", ...(excludeId ? { id: { not: excludeId } } : {}) },
  });
}

export async function updateUser(
  id: string,
  _prevState: UpdateUserFormState,
  formData: FormData
): Promise<UpdateUserFormState> {
  const session = await verifyAdminSession();

  const validated = UpdateUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    title: formData.get("title") ?? "",
    department: formData.get("department") ?? "",
    personalPhone: formData.get("personalPhone") ?? "",
    companyPhone: formData.get("companyPhone") ?? "",
    newPassword: formData.get("newPassword") ?? "",
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const target = await prisma.user.findUnique({ where: { id }, include: { teamMember: true } });
  if (!target) {
    return { message: "Kullanıcı bulunamadı." };
  }

  const emailTaken = await prisma.user.findFirst({
    where: { email: validated.data.email, id: { not: id } },
  });
  if (emailTaken) {
    return { errors: { email: ["Bu e-posta adresi başka bir kullanıcıda kayıtlı."] } };
  }

  // Son admini editöre düşürmeyi engelle — kilitlenip dışarıda kalmayı önler.
  if (target.role === "ADMIN" && validated.data.role === "EDITOR") {
    const remainingAdmins = await countAdmins(id);
    if (remainingAdmins === 0) {
      return {
        errors: { role: ["Sistemde en az bir yönetici kalmalı — son yöneticiyi editöre düşüremezsiniz."] },
      };
    }
  }

  const data: Record<string, unknown> = {
    name: validated.data.name,
    email: validated.data.email,
    role: validated.data.role,
    title: validated.data.title || null,
    department: validated.data.department || null,
    personalPhone: validated.data.personalPhone || null,
    companyPhone: validated.data.companyPhone || null,
  };

  if (validated.data.newPassword) {
    data.passwordHash = await hashPassword(validated.data.newPassword);
  }

  await prisma.user.update({ where: { id }, data });

  // Ekibe bağlıysa "aynı data" ilkesi: Görev/Ad Soyad Kullanıcılar panelinden
  // yönetilir, Hakkımızda > Ekip Üyeleri'ndeki isim/unvan buradan senkronize
  // edilir (tersi yönde de bkz. modules/about/actions.ts#updateTeamMember).
  if (target.teamMember) {
    await prisma.teamMember.update({
      where: { id: target.teamMember.id },
      data: {
        name: validated.data.name,
        role: validated.data.title?.trim() || "Ekip Üyesi",
      },
    });
    revalidatePath("/about");
    revalidatePath("/admin/about");
  }

  await logAudit({
    actorId: session.userId,
    action: "UPDATE",
    entityType: "User",
    entityId: id,
    diff: { email: validated.data.email, role: validated.data.role, passwordReset: !!validated.data.newPassword },
  });

  revalidatePath("/admin/users");
  return { success: true, message: "Kaydedildi." };
}

export async function deleteUser(id: string) {
  const session = await verifyAdminSession();

  if (id === session.userId) {
    throw new Error("Kendi hesabınızı silemezsiniz.");
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return;

  if (target.role === "ADMIN") {
    const remainingAdmins = await countAdmins(id);
    if (remainingAdmins === 0) {
      throw new Error("Sistemde en az bir yönetici kalmalı — son yöneticiyi silemezsiniz.");
    }
  }

  await prisma.user.delete({ where: { id } });

  await logAudit({
    actorId: session.userId,
    action: "DELETE",
    entityType: "User",
    entityId: id,
    diff: { email: target.email },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/about");
  revalidatePath("/about");
}

/** Sonradan eklenmiş/işaretlenmemiş bir kullanıcıyı ekip listesine bağlar. */
export async function addUserToTeam(id: string) {
  const session = await verifyAdminSession();

  const user = await prisma.user.findUnique({ where: { id }, include: { teamMember: true } });
  if (!user || user.teamMember) return;

  const member = await createTeamMemberForUser(user);

  await logAudit({
    actorId: session.userId,
    action: "CREATE",
    entityType: "TeamMember",
    entityId: member.id,
    diff: { fromUser: id },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/about");
  revalidatePath("/about");
}

/** Ekip bağlantısını koparır — public bio kaydı silinmez, sadece hesapla ilişkisi kalkar. */
export async function removeUserFromTeam(id: string) {
  const session = await verifyAdminSession();

  const user = await prisma.user.findUnique({ where: { id }, include: { teamMember: true } });
  if (!user?.teamMember) return;

  await prisma.teamMember.update({
    where: { id: user.teamMember.id },
    data: { linkedUserId: null },
  });

  await logAudit({
    actorId: session.userId,
    action: "UPDATE",
    entityType: "TeamMember",
    entityId: user.teamMember.id,
    diff: { unlinkedFromUser: id },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/about");
}
