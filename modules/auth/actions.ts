"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createSession, deleteSession } from "@/lib/session";
import { LoginSchema, type LoginFormState } from "./schema";

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
