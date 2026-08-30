"use server";

import { cache } from "react";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/modules/shared/dal";
import { logAudit } from "@/modules/shared/audit";

/** Admin: tüm sayfalar. */
export async function listSitePages() {
  return prisma.sitePage.findMany({ orderBy: { key: "asc" } });
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
