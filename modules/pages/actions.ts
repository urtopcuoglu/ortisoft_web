"use server";

import { cache } from "react";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/modules/shared/dal";
import { logAudit } from "@/modules/shared/audit";
import { PageSeoSchema, PAGE_ROUTE, type PageSeoFormState } from "./schema";

/** Admin: tüm sayfalar. */
export async function listSitePages() {
  return prisma.sitePage.findMany({ orderBy: { key: "asc" } });
}

export async function getSitePage(key: string) {
  return prisma.sitePage.findUnique({ where: { key } });
}

/**
 * Public sayfaların generateMetadata()'sı bunu çağırır. Kayıt yoksa (henüz
 * seed edilmemiş bir key) null döner — çağıran taraf kendi statik/dinamik
 * varsayılanına düşer, build asla çökmez.
 */
export const getPageSeo = cache(async (key: string) => {
  const page = await prisma.sitePage.findUnique({
    where: { key },
    select: { seoTitle: true, seoDescription: true, seoKeywords: true },
  });
  return page;
});

export async function updatePageSeo(
  key: string,
  _prevState: PageSeoFormState,
  formData: FormData
): Promise<PageSeoFormState> {
  const session = await verifySession();

  const validated = PageSeoSchema.safeParse({
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
    seoKeywords: formData.get("seoKeywords") ?? "",
  });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  await prisma.sitePage.update({
    where: { key },
    data: {
      seoTitle: validated.data.seoTitle || null,
      seoDescription: validated.data.seoDescription || null,
      seoKeywords: validated.data.seoKeywords || null,
    },
  });

  await logAudit({
    actorId: session.userId,
    action: "UPDATE",
    entityType: "SitePage",
    entityId: key,
    diff: { seo: true },
  });

  revalidatePath("/admin/pages");
  const route = PAGE_ROUTE[key];
  if (route) revalidatePath(route);

  return { success: true, message: "Kaydedildi." };
}

/**
 * Public sayfaların en üstünde çağrılır — o sayfa "coming soon" modunda mı?
 * React cache() ile bir render pass'i içinde tekilleştirilir. Kayıt yoksa
 * (ör. henüz seed edilmemiş) varsayılan olarak aktif (false) kabul edilir —
 * site hiçbir zaman yanlışlıkla tamamen kilitlenmesin diye.
 */
export const isPageComingSoon = cache(async (key: string) => {
  const page = await prisma.sitePage.findUnique({ where: { key } });
  return page?.comingSoon ?? false;
});

export async function toggleComingSoon(key: string, comingSoon: boolean) {
  const session = await verifySession();

  await prisma.sitePage.update({ where: { key }, data: { comingSoon } });

  await logAudit({
    actorId: session.userId,
    action: "UPDATE",
    entityType: "SitePage",
    entityId: key,
    diff: { comingSoon },
  });

  revalidatePath("/admin/pages");
  revalidatePath("/", "layout");
}
