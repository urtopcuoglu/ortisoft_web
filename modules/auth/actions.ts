"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword, hashPassword } from "@/lib/password";
import { createSession, deleteSession } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifySession } from "@/modules/shared/dal";
import { logAudit } from "@/modules/shared/audit";
import { LoginSchema, ChangePasswordSchema, type LoginFormState, type ChangePasswordFormState } from "./schema";

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
