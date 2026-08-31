"use server";

import { cache } from "react";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/modules/shared/dal";
import { logAudit } from "@/modules/shared/audit";
import { SiteSettingsSchema, type SiteSettingsFormState } from "./schema";

const SINGLETON_ID = "singleton";

/**
 * Header/Footer'daki iletişim bilgileri ve sosyal medya linkleri — tek
 * satırlık (singleton) kayıt. Hiç yoksa (seed edilmemiş) null döner, çağıran
 * taraf (Footer.tsx) kendi sabit varsayılanlarına düşer — public site asla
 * boş/kırık görünmez.
 */
export const getSiteSettings = cache(async () => {
  return prisma.siteSettings.findUnique({ where: { id: SINGLETON_ID } });
});

export async function updateSiteSettings(
  _prevState: SiteSettingsFormState,
  formData: FormData
): Promise<SiteSettingsFormState> {
  const session = await verifySession();

  const validated = SiteSettingsSchema.safeParse({
    contactEmail: formData.get("contactEmail") ?? "",
    contactPhone1: formData.get("contactPhone1") ?? "",
    contactPhone2: formData.get("contactPhone2") ?? "",
    address: formData.get("address") ?? "",
    addressMapUrl: formData.get("addressMapUrl") ?? "",
    linkedinUrl: formData.get("linkedinUrl") ?? "",
    twitterUrl: formData.get("twitterUrl") ?? "",
    githubUrl: formData.get("githubUrl") ?? "",
  });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const data = {
    contactEmail: validated.data.contactEmail || null,
    contactPhone1: validated.data.contactPhone1 || null,
    contactPhone2: validated.data.contactPhone2 || null,
    address: validated.data.address || null,
    addressMapUrl: validated.data.addressMapUrl || null,
    linkedinUrl: validated.data.linkedinUrl || null,
    twitterUrl: validated.data.twitterUrl || null,
    githubUrl: validated.data.githubUrl || null,
  };

  await prisma.siteSettings.upsert({
    where: { id: SINGLETON_ID },
    update: data,
    create: { id: SINGLETON_ID, ...data },
  });

  await logAudit({
    actorId: session.userId,
    action: "UPDATE",
    entityType: "SiteSettings",
    entityId: SINGLETON_ID,
  });

  revalidatePath("/admin/site-settings");
  revalidatePath("/", "layout");

  return { success: true, message: "Kaydedildi." };
}
