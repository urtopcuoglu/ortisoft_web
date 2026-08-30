import { z } from "zod";
import { COLOR_THEME_NAMES } from "@/lib/color-theme";

export const AboutContentSchema = z.object({
  heroTitle: z.string().trim().min(2, { error: "Başlık en az 2 karakter olmalı." }),
  heroSubtitle: z.string().trim().min(10, { error: "Alt başlık en az 10 karakter olmalı." }),
  aboutText: z.string().trim().min(20, { error: "Hakkımızda yazısı en az 20 karakter olmalı." }),
  missionText: z.string().trim().min(20, { error: "Misyon metni en az 20 karakter olmalı." }),
  visionText: z.string().trim().min(20, { error: "Vizyon metni en az 20 karakter olmalı." }),
});

export type AboutContentFormState =
  | { errors?: Record<string, string[]>; message?: string; success?: boolean }
  | undefined;

export const TeamMemberSchema = z.object({
  name: z.string().trim().min(2, { error: "İsim en az 2 karakter olmalı." }),
  role: z.string().trim().min(2, { error: "Unvan en az 2 karakter olmalı." }),
  bio: z.string().trim().min(1, { error: "Kısa biyografi girin." }),
  photoUrl: z
    .union([z.url({ error: "Geçerli bir görsel URL'si girin." }), z.literal("")])
    .optional(),
  colorTheme: z.enum(COLOR_THEME_NAMES, { error: "Geçerli bir renk teması seçin." }),
  linkedinUrl: z
    .union([z.url({ error: "Geçerli bir LinkedIn URL'si girin." }), z.literal("")])
    .optional(),
  // Formdan çok satırlı metin olarak gelir, her satır bir uzmanlık etiketidir.
  specialties: z
    .string()
    .transform((val) =>
      val
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
    ),
  sortOrder: z.coerce.number().int().default(0),
});

export type TeamMemberFormState =
  | { errors?: Record<string, string[]>; message?: string; success?: boolean }
  | undefined;
