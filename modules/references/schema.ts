import { z } from "zod";

export const ReferenceSchema = z.object({
  clientName: z.string().trim().min(2, { error: "Marka adı en az 2 karakter olmalı." }),
  description: z.string().trim().min(5, { error: "Açıklama en az 5 karakter olmalı." }),
  logoUrl: z
    .union([z.url({ error: "Geçerli bir görsel URL'si girin." }), z.literal("")])
    .optional(),
  projectLink: z
    .union([z.url({ error: "Geçerli bir link girin." }), z.literal("")])
    .optional(),
  sortOrder: z.coerce.number().int().default(0),
});

export type ReferenceFormState =
  | { errors?: Record<string, string[]>; message?: string; success?: boolean }
  | undefined;
