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
