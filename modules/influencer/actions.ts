"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/modules/shared/dal";
import { logAudit } from "@/modules/shared/audit";
import { slugifyPlatformName } from "@/lib/utils";
import { resolveInfluencerProfileUrl } from "@/lib/social-platform";
import {
  InfluencerSchema,
  NEW_PLATFORM_VALUE,
  type InfluencerAccountInput,
  type InfluencerFormState,
} from "./schema";

export async function listInfluencers() {
  await verifySession();
  return prisma.influencer.findMany({
    orderBy: { recordDate: "desc" },
    include: { accounts: { include: { platform: true }, orderBy: { createdAt: "asc" } } },
  });
}

export async function listInfluencerPlatforms() {
  await verifySession();
  return prisma.influencerPlatform.findMany({ orderBy: { name: "asc" } });
}

/** QR route handler'ı için — bkz. app/(admin)/admin/(protected)/crm/influencer-qr/[accountId]/route.ts. */
export async function getInfluencerAccountForQr(accountId: string) {
  await verifySession();
  return prisma.influencerSocialAccount.findUnique({
    where: { id: accountId },
    include: { platform: true },
  });
}

/**
 * Bir hesap satırının platformunu çözer — GuideContact'taki resolveCategoryId
 * ile aynı desen: "+ yeni platform ekle" seçilip yeni bir ad girildiyse önce
 * o platformu oluşturur (aynı ad zaten varsa, büyük/küçük harf duyarsız
 * olarak mevcut kaydı kullanır). Slug çakışırsa kısa bir rastgele son ek
 * eklenir.
 */
async function resolvePlatform(
  row: InfluencerAccountInput
): Promise<{ platform: { id: string; slug: string } } | { error: string }> {
  if (row.platformId !== NEW_PLATFORM_VALUE) {
    const existing = await prisma.influencerPlatform.findUnique({
      where: { id: row.platformId },
      select: { id: true, slug: true },
    });
    if (!existing) return { error: "Seçilen platform bulunamadı." };
    return { platform: existing };
  }

  const name = row.newPlatformName.trim();
  if (name.length < 2) {
    return { error: "Yeni platform adı en az 2 karakter olmalı." };
  }

  const existingByName = await prisma.influencerPlatform.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
    select: { id: true, slug: true },
  });
  if (existingByName) return { platform: existingByName };

  let slug = slugifyPlatformName(name);
  if (await prisma.influencerPlatform.findUnique({ where: { slug } })) {
    slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const created = await prisma.influencerPlatform.create({
    data: { name, slug },
    select: { id: true, slug: true },
  });
  return { platform: created };
}

type ResolvedInfluencerAccount = {
  platformId: string;
  username: string;
  profileUrl: string | null;
  followerCount: number;
};

async function resolveAccountsData(
  accounts: InfluencerAccountInput[]
): Promise<{ error: string } | { accounts: ResolvedInfluencerAccount[] }> {
  const resolved: ResolvedInfluencerAccount[] = [];

  for (const row of accounts) {
    const result = await resolvePlatform(row);
    if ("error" in result) return { error: result.error };

    const autoUrl = resolveInfluencerProfileUrl(result.platform.slug, row.username);
    resolved.push({
      platformId: result.platform.id,
      username: row.username,
      profileUrl: row.profileUrl || autoUrl,
      followerCount: row.followerCount,
    });
  }

  return { accounts: resolved };
}

function parseInfluencerForm(formData: FormData) {
  return InfluencerSchema.safeParse({
    firstName: formData.get("firstName") ?? "",
    lastName: formData.get("lastName") ?? "",
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    accountsJson: formData.get("accountsJson") ?? "[]",
  });
}

export async function createInfluencer(
  _prevState: InfluencerFormState,
  formData: FormData
): Promise<InfluencerFormState> {
  const session = await verifySession();

  const validated = parseInfluencerForm(formData);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const accountsResult = await resolveAccountsData(validated.data.accountsJson);
  if ("error" in accountsResult) {
    return { errors: { accountsJson: [accountsResult.error] } };
  }

  const influencer = await prisma.influencer.create({
    data: {
      firstName: validated.data.firstName || null,
      lastName: validated.data.lastName || null,
      email: validated.data.email || null,
      phone: validated.data.phone || null,
      // Kayıt tarihi modalde alan olarak sorulmaz, kayıt anında otomatik basılır.
      recordDate: new Date(),
      accounts: { create: accountsResult.accounts },
    },
  });

  await logAudit({
    actorId: session.userId,
    action: "CREATE",
    entityType: "Influencer",
    entityId: influencer.id,
  });

  revalidatePath("/admin/crm");
  return { success: true, message: "Influencer eklendi." };
}

export async function updateInfluencer(
  id: string,
  _prevState: InfluencerFormState,
  formData: FormData
): Promise<InfluencerFormState> {
  const session = await verifySession();

  const validated = parseInfluencerForm(formData);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const accountsResult = await resolveAccountsData(validated.data.accountsJson);
  if ("error" in accountsResult) {
    return { errors: { accountsJson: [accountsResult.error] } };
  }

  // Hesap satırları düzenlemede tek tek eşleştirilmiyor — basitlik için
  // mevcut tüm hesaplar silinip gönderilen liste yeniden oluşturuluyor
  // (hesapların başka hiçbir tabloda referansı yok, bkz. prisma/schema.prisma).
  await prisma.$transaction([
    prisma.influencerSocialAccount.deleteMany({ where: { influencerId: id } }),
    prisma.influencer.update({
      where: { id },
      data: {
        firstName: validated.data.firstName || null,
        lastName: validated.data.lastName || null,
        email: validated.data.email || null,
        phone: validated.data.phone || null,
        // recordDate kasıtlı olarak değiştirilmiyor — ilk kayıt anı korunur.
        accounts: { create: accountsResult.accounts },
      },
    }),
  ]);

  await logAudit({
    actorId: session.userId,
    action: "UPDATE",
    entityType: "Influencer",
    entityId: id,
  });

  revalidatePath("/admin/crm");
  return { success: true, message: "Kaydedildi." };
}

export async function deleteInfluencer(id: string) {
  const session = await verifySession();

  // GuideContact'ın aksine burada FK Restrict yok — influencer kayıtları
  // hiçbir alt-varlığa (görüşme/teklif/sözleşme/ödeme) bağlı değil, bu yüzden
  // doğrudan silinebilir (hesapları Cascade ile birlikte gider).
  await prisma.influencer.delete({ where: { id } });

  await logAudit({
    actorId: session.userId,
    action: "DELETE",
    entityType: "Influencer",
    entityId: id,
  });

  revalidatePath("/admin/crm");
}
