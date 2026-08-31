import { z } from "zod";

const optionalText = (max: number) =>
  z.union([z.string().trim().max(max), z.literal("")]).optional();
const optionalUrl = () =>
  z.union([z.url({ error: "Geçerli bir URL girin." }), z.literal("")]).optional();
const optionalEmail = () =>
  z.union([z.email({ error: "Geçerli bir e-posta girin." }), z.literal("")]).optional();

export const SiteSettingsSchema = z.object({
  contactEmail: optionalEmail(),
  contactPhone1: optionalText(50),
  contactPhone2: optionalText(50),
  address: optionalText(200),
  addressMapUrl: optionalUrl(),
  linkedinUrl: optionalUrl(),
  twitterUrl: optionalUrl(),
  githubUrl: optionalUrl(),
});

export type SiteSettingsFormState =
  | { errors?: Record<string, string[]>; message?: string; success?: boolean }
  | undefined;
