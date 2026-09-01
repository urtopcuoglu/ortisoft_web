"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyPassword, hashPassword } from "@/lib/password";
import { createSession, deleteSession } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifySession, verifyAdminSession } from "@/modules/shared/dal";
import { logAudit } from "@/modules/shared/audit";
import {
  LoginSchema,
  ChangePasswordSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  type LoginFormState,
  type ChangePasswordFormState,
  type ForgotPasswordFormState,
  type ResetPasswordFormState,
} from "./schema";

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 dakika

export async function login(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const validatedFields = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { email, password } = validatedFields.data;

  // Kaba kuvvet koruması — e-posta bazlı (tek admin hesabı olduğu için
  // saldırganın hedefi zaten sabit, IP bazlı olmasına gerek yok).
  const { allowed, retryAfterMs } = checkRateLimit(`login:${email}`, {
    maxAttempts: LOGIN_MAX_ATTEMPTS,
    windowMs: LOGIN_WINDOW_MS,
  });
  if (!allowed) {
    const minutes = Math.ceil(retryAfterMs / 60000);
    return { message: `Çok fazla başarısız deneme. Lütfen ${minutes} dakika sonra tekrar deneyin.` };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Kullanıcı bulunamasa da sabit maliyetli bir doğrulama çalıştırılır —
  // aksi halde yanıt süresi farkından "bu e-posta kayıtlı mı" sızdırılabilir.
  const passwordHash = user?.passwordHash ?? "$argon2id$v=19$m=19456,t=2,p=1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
  const passwordValid = await verifyPassword(passwordHash, password);

  if (!user || !passwordValid) {
    // Kasıtlı olarak genel bir hata: "e-posta yok" ile "şifre yanlış" ayrımı yapılmaz.
    return { message: "E-posta veya şifre hatalı." };
  }

  await createSession(user.id, user.role);
  redirect("/admin/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/admin/login");
}

export async function changePassword(
  _prevState: ChangePasswordFormState,
  formData: FormData
): Promise<ChangePasswordFormState> {
  const session = await verifySession();

  const validated = ChangePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) {
    return { message: "Kullanıcı bulunamadı." };
  }

  const currentValid = await verifyPassword(user.passwordHash, validated.data.currentPassword);
  if (!currentValid) {
    return { errors: { currentPassword: ["Mevcut şifreniz yanlış."] } };
  }

  const newHash = await hashPassword(validated.data.newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });

  await logAudit({
    actorId: session.userId,
    action: "UPDATE",
    entityType: "User",
    entityId: user.id,
    diff: { field: "passwordHash" },
  });

  return { success: true, message: "Şifreniz güncellendi." };
}

// ─────────────────────────────────────────────────────────
// "Şifremi Unuttum" — mail sunucusu YOK, bu yüzden self-servis değil: kullanıcı
// talep açar, bir ADMIN /admin/password-resets'ten görüp onaylar/reddeder.
// Onaylanınca tek kullanımlık/süreli bir token üretilir; admin bu linki
// (/admin/reset-password/[token]) kullanıcıya başka bir kanaldan (telefon/
// WhatsApp) elle iletir. Bkz. prisma/schema.prisma#PasswordResetRequest.
// ─────────────────────────────────────────────────────────

const RESET_REQUEST_MAX_ATTEMPTS = 3;
const RESET_REQUEST_WINDOW_MS = 15 * 60 * 1000; // 15 dakika
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 saat

const GENERIC_RESET_MESSAGE =
  "İsteğiniz alındı. Bu e-posta sistemde kayıtlıysa, bir yönetici onayladığında size başka bir kanaldan (telefon/mesaj) ulaşılacaktır.";

export async function requestPasswordReset(
  _prevState: ForgotPasswordFormState,
  formData: FormData
): Promise<ForgotPasswordFormState> {
  const validated = ForgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }
  const { email } = validated.data;

  // Kaba kuvvet/spam koruması — talep sayısı kısıtlansa da aşağıda HER ZAMAN
  // aynı jenerik mesaj dönülür (login'deki gibi, "bu e-posta kayıtlı mı"
  // sızdırılmasın diye).
  const { allowed } = checkRateLimit(`password-reset:${email}`, {
    maxAttempts: RESET_REQUEST_MAX_ATTEMPTS,
    windowMs: RESET_REQUEST_WINDOW_MS,
  });

  if (allowed) {
    const user = await prisma.user.findUnique({ where: { email } });
    // Kayıt SADECE eşleşen bir kullanıcı varsa oluşturulur — olmayan e-postalar
    // için admin panelinde gürültü/hedef listesi birikmesin.
    if (user) {
      const existingPending = await prisma.passwordResetRequest.findFirst({
        where: { userId: user.id, status: "PENDING" },
      });
      if (!existingPending) {
        await prisma.passwordResetRequest.create({ data: { email, userId: user.id } });
      }
    }
  }

  return { success: true, message: GENERIC_RESET_MESSAGE };
}

/** Admin: bekleyen/geçmiş tüm şifre sıfırlama talepleri (/admin/password-resets). */
export async function listPasswordResetRequests() {
  await verifyAdminSession();
  return prisma.passwordResetRequest.findMany({
    orderBy: { requestedAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      resolvedBy: { select: { name: true } },
    },
  });
}

/**
 * Sidebar'daki bekleyen talep rozeti için — verifyAdminSession() KULLANMAZ
 * (o, admin olmayanı /admin/dashboard'a yönlendirir; bu fonksiyon layout'ta
 * HER role için çağrıldığından bir EDITOR'ı yanlışlıkla yönlendirmemeli).
 * Admin değilse sessizce 0 döner.
 */
export async function countPendingPasswordResetRequests() {
  const session = await verifySession();
  if (session.role !== "ADMIN") return 0;
  return prisma.passwordResetRequest.count({ where: { status: "PENDING" } });
}

/** Admin: talebi onaylar — PENDING veya süresi dolmuş APPROVED için yeni bir token üretir. */
export async function approvePasswordResetRequest(id: string) {
  const session = await verifyAdminSession();

  const token = randomBytes(32).toString("hex");
  const tokenExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await prisma.passwordResetRequest.update({
    where: { id },
    data: {
      status: "APPROVED",
      token,
      tokenExpiresAt,
      resolvedAt: new Date(),
      resolvedById: session.userId,
    },
  });

  await logAudit({
    actorId: session.userId,
    action: "UPDATE",
    entityType: "PasswordResetRequest",
    entityId: id,
    diff: { status: "APPROVED" },
  });

  revalidatePath("/admin/password-resets");
}

/** Admin: talebi reddeder — token varsa iptal edilir (bir daha kullanılamaz). */
export async function dismissPasswordResetRequest(id: string) {
  const session = await verifyAdminSession();

  await prisma.passwordResetRequest.update({
    where: { id },
    data: { status: "DISMISSED", token: null, tokenExpiresAt: null, resolvedAt: new Date(), resolvedById: session.userId },
  });

  await logAudit({
    actorId: session.userId,
    action: "UPDATE",
    entityType: "PasswordResetRequest",
    entityId: id,
    diff: { status: "DISMISSED" },
  });

  revalidatePath("/admin/password-resets");
}

/** Public: /admin/reset-password/[token] sayfası token'ın geçerliliğini bununla kontrol eder. */
export async function getPasswordResetRequestByToken(token: string) {
  const request = await prisma.passwordResetRequest.findUnique({ where: { token } });
  if (!request || request.status !== "APPROVED" || !request.userId) return null;
  if (!request.tokenExpiresAt || request.tokenExpiresAt < new Date()) return null;
  return request;
}

export async function resetPasswordWithToken(
  token: string,
  _prevState: ResetPasswordFormState,
  formData: FormData
): Promise<ResetPasswordFormState> {
  const validated = ResetPasswordSchema.safeParse({
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const request = await getPasswordResetRequestByToken(token);
  if (!request || !request.userId) {
    return { message: "Bu bağlantı geçersiz veya süresi dolmuş. Lütfen yeniden talep oluşturun." };
  }

  const newHash = await hashPassword(validated.data.newPassword);
  const userId = request.userId;

  // Tek işlemde hem şifre güncellenir hem token tüketilir (USED) — token bir
  // daha kullanılamaz, aynı bağlantıya ikinci kez gidilirse geçersiz sayılır.
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } }),
    prisma.passwordResetRequest.update({
      where: { id: request.id },
      data: { status: "USED", token: null, tokenExpiresAt: null },
    }),
  ]);

  await logAudit({
    actorId: userId,
    action: "UPDATE",
    entityType: "User",
    entityId: userId,
    diff: { field: "passwordHash", via: "password-reset-token" },
  });

  return { success: true, message: "Şifreniz güncellendi. Şimdi giriş yapabilirsiniz." };
}
