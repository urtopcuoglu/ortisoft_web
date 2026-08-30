import { z } from "zod";

export const USER_ROLES = ["ADMIN", "EDITOR"] as const;
export type UserRoleValue = (typeof USER_ROLES)[number];

export const USER_ROLE_LABEL: Record<UserRoleValue, string> = {
  ADMIN: "Yönetici",
  EDITOR: "Editör",
};

const optionalText = (max: number) =>
  z.union([z.string().trim().max(max), z.literal("")]).optional();

export const CreateUserSchema = z
  .object({
    name: z.string().trim().min(2, { error: "Ad soyad en az 2 karakter olmalı." }).max(200),
    email: z.email({ error: "Geçerli bir e-posta adresi girin." }).trim(),
    password: z.string().min(8, { error: "Şifre en az 8 karakter olmalı." }),
    confirmPassword: z.string(),
    role: z.enum(USER_ROLES, { error: "Geçerli bir rol seçin." }),
    title: optionalText(200),
    department: optionalText(200),
    personalPhone: optionalText(50),
    companyPhone: optionalText(50),
    // Checkbox'lar işaretliyse tarayıcı "on" gönderir; boşsa formData'da hiç yer almaz.
    addToTeam: z.literal("on").optional(),
    sendCredentials: z.literal("on").optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Şifreler eşleşmiyor.",
    path: ["confirmPassword"],
  });

export type CreateUserFormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
      success?: boolean;
      credentialsEmailSent?: boolean;
    }
  | undefined;

// Şifre değiştirme isteğe bağlıdır — boş bırakılırsa mevcut şifre korunur.
export const UpdateUserSchema = z
  .object({
    name: z.string().trim().min(2, { error: "Ad soyad en az 2 karakter olmalı." }).max(200),
    email: z.email({ error: "Geçerli bir e-posta adresi girin." }).trim(),
    role: z.enum(USER_ROLES, { error: "Geçerli bir rol seçin." }),
    title: optionalText(200),
    department: optionalText(200),
    personalPhone: optionalText(50),
    companyPhone: optionalText(50),
    newPassword: z.union([z.string().min(8), z.literal("")]).optional(),
  })
  .refine((data) => !data.newPassword || data.newPassword.length >= 8, {
    error: "Yeni şifre en az 8 karakter olmalı.",
    path: ["newPassword"],
  });

export type UpdateUserFormState =
  | { errors?: Record<string, string[]>; message?: string; success?: boolean }
  | undefined;
