import { z } from "zod";

export const LoginSchema = z.object({
  email: z.email({ error: "Geçerli bir e-posta adresi girin." }).trim(),
  password: z
    .string()
    .min(8, { error: "Şifre en az 8 karakter olmalı." }),
});

export type LoginFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { error: "Mevcut şifrenizi girin." }),
    newPassword: z
      .string()
      .min(8, { error: "Yeni şifre en az 8 karakter olmalı." })
      .regex(/[a-zA-Z]/, { error: "En az bir harf içermeli." })
      .regex(/[0-9]/, { error: "En az bir rakam içermeli." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    error: "Yeni şifreler eşleşmiyor.",
    path: ["confirmPassword"],
  });

export type ChangePasswordFormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
      success?: boolean;
    }
  | undefined;
