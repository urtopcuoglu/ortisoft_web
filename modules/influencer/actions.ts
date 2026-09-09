"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/modules/shared/dal";
import { logAudit } from "@/modules/shared/audit";
import { slugifyPlatformName } from "@/lib/utils";
import { resolveInfluencerProfileUrl } from "@/lib/social-platform";
import {
  BulkImportRowSchema,
  InfluencerSchema,
  NEW_CONTENT_CATEGORY_VALUE,
  NEW_PLATFORM_VALUE,
  type BulkImportResult,
  type BulkImportRowInput,
  type InfluencerAccountInput,
  type InfluencerFormState,
} from "./schema";

export async function listInfluencers() {
  await verifySession();
  return prisma.influencer.findMany({
    orderBy: { recordDate: "desc" },
    include: {
      accounts: { include: { platform: true }, orderBy: { createdAt: "asc" } },
      contentCategory: { select: { id: true, name: true } },
    },
  });
}

export async function listInfluencerPlatforms() {
  await verifySession();
  return prisma.influencerPlatform.findMany({ orderBy: { name: "asc" } });
}

export async function listInfluencerContentCategories() {
  await verifySession();
  return prisma.influencerContentCategory.findMany({ orderBy: { name: "asc" } });
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
 * Bir platform adını çözer — aynı ad zaten varsa (büyük/küçük harf duyarsız)
 * mevcut kaydı kullanır, yoksa yeni oluşturur. Slug çakışırsa kısa bir
 * rastgele son ek eklenir. Hem manuel form akışındaki "+ yeni platform ekle"
 * (bkz. resolvePlatform) hem de Excel/CSV içe aktarımdaki serbest metin
 * "Platform" sütunu (bkz. bulkImportInfluencers) bunu kullanır.
 */
async function resolvePlatformByName(
  rawName: string
): Promise<{ platform: { id: string; slug: string } } | { error: string }> {
  const name = rawName.trim();
  if (name.length < 2) {
    return { error: "Platform adı en az 2 karakter olmalı." };
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

/**
 * Bir hesap satırının platformunu çözer — GuideContact'taki resolveCategoryId
 * ile aynı desen: "+ yeni platform ekle" seçilip yeni bir ad girildiyse
 * resolvePlatformByName üzerinden oluşturur/eşler, aksi halde platformId ile
 * doğrudan arar.
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

  return resolvePlatformByName(row.newPlatformName);
}

/**
 * İçerik kategorisi adını çözer — resolvePlatformByName ile aynı desen
 * (ad varsa büyük/küçük harf duyarsız eşleşir, yoksa oluşturulur). Hem manuel
 * form akışındaki "+ yeni kategori ekle" (bkz. resolveContentCategoryId) hem
 * de Excel/CSV içe aktarımdaki serbest metin "İçerik Kategorisi" sütunu
 * (bkz. bulkImportInfluencers) bunu kullanır.
 */
async function resolveContentCategoryByName(rawName: string): Promise<{ id: string } | { error: string }> {
  const name = rawName.trim();
  if (name.length < 2) {
    return { error: "Kategori adı en az 2 karakter olmalı." };
  }

  const existing = await prisma.influencerContentCategory.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
    select: { id: true },
  });
  if (existing) return { id: existing.id };

  const created = await prisma.influencerContentCategory.create({ data: { name }, select: { id: true } });
  return { id: created.id };
}

/**
 * Manuel form akışındaki içerik kategorisi seçimini çözer — GuideContact'taki
 * resolveCategoryId ile aynı desen, tek fark OPSİYONEL olması: boş bırakılırsa
 * influencer kategorisiz kaydedilir (null).
 */
async function resolveContentCategoryId(
  contentCategoryId: string,
  newContentCategoryName: string
): Promise<{ id: string | null } | { error: string }> {
  if (contentCategoryId === NEW_CONTENT_CATEGORY_VALUE) {
    const result = await resolveContentCategoryByName(newContentCategoryName);
    if ("error" in result) return { error: result.error };
    return { id: result.id };
  }

  if (!contentCategoryId) return { id: null };

  const existing = await prisma.influencerContentCategory.findUnique({
    where: { id: contentCategoryId },
    select: { id: true },
  });
  if (!existing) return { error: "Seçilen kategori bulunamadı." };
  return { id: existing.id };
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
    address: formData.get("address") ?? "",
    contentCategoryId: formData.get("contentCategoryId") ?? "",
    newContentCategoryName: formData.get("newContentCategoryName") ?? "",
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

  const categoryResult = await resolveContentCategoryId(
    validated.data.contentCategoryId,
    validated.data.newContentCategoryName
  );
  if ("error" in categoryResult) {
    return { errors: { contentCategoryId: [categoryResult.error] } };
  }

  const influencer = await prisma.influencer.create({
    data: {
      firstName: validated.data.firstName || null,
      lastName: validated.data.lastName || null,
      email: validated.data.email || null,
      phone: validated.data.phone || null,
      address: validated.data.address || null,
      contentCategoryId: categoryResult.id,
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

  const categoryResult = await resolveContentCategoryId(
    validated.data.contentCategoryId,
    validated.data.newContentCategoryName
  );
  if ("error" in categoryResult) {
    return { errors: { contentCategoryId: [categoryResult.error] } };
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
        address: validated.data.address || null,
        contentCategoryId: categoryResult.id,
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

/**
 * Excel/CSV içe aktarma — dosya tarayıcıda satır dizisine çevrilip
 * (bkz. lib/influencer-import-export.ts#parseInfluencerImportFile) buraya
 * gönderilir. Her satır ayrı ayrı çözümlenir; bir satırdaki hata diğer
 * satırları etkilemez (hatalı satırlar atlanıp `errors` içinde raporlanır).
 * Platform adları bir Map'te önbelleğe alınır ki aynı platform (ör.
 * "Instagram") yüzlerce satırda tekrar etse bile tek DB sorgusuyla çözülsün.
 */
export async function bulkImportInfluencers(rows: BulkImportRowInput[]): Promise<BulkImportResult> {
  const session = await verifySession();

  const validated = z.array(BulkImportRowSchema).safeParse(rows);
  if (!validated.success) {
    return { createdCount: 0, errors: [{ row: 0, message: "Dosya verisi okunamadı." }] };
  }

  const platformCache = new Map<string, { platform: { id: string; slug: string } } | { error: string }>();
  async function cachedResolvePlatformByName(rawName: string) {
    const key = (rawName.trim() || "diğer").toLowerCase();
    if (!platformCache.has(key)) {
      platformCache.set(key, await resolvePlatformByName(rawName || "Diğer"));
    }
    return platformCache.get(key)!;
  }

  // Kategori boşsa (Excel'de sütun boş bırakıldıysa) kategorisiz aktarılır —
  // platformun aksine burada "Diğer" gibi bir varsayılana ZORLANMAZ.
  const categoryCache = new Map<string, { id: string } | { error: string }>();
  async function cachedResolveContentCategoryByName(rawName: string): Promise<{ id: string | null } | { error: string }> {
    const name = rawName.trim();
    if (!name) return { id: null };
    const key = name.toLowerCase();
    if (!categoryCache.has(key)) {
      categoryCache.set(key, await resolveContentCategoryByName(name));
    }
    return categoryCache.get(key)!;
  }

  const errors: { row: number; message: string }[] = [];
  const toCreate: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    contentCategoryId: string | null;
    accounts: ResolvedInfluencerAccount[];
  }[] = [];

  for (let i = 0; i < validated.data.length; i++) {
    const row = validated.data[i];
    const rowNumber = i + 2; // 1. satır başlık, veri Excel'de 2. satırdan başlar

    if (row.accounts.length === 0) {
      errors.push({ row: rowNumber, message: "En az bir sosyal medya hesabı (kullanıcı adı) gerekli." });
      continue;
    }

    const resolvedAccounts: ResolvedInfluencerAccount[] = [];
    let rowError: string | null = null;
    for (const acc of row.accounts) {
      const platformResult = await cachedResolvePlatformByName(acc.platformName);
      if ("error" in platformResult) {
        rowError = platformResult.error;
        break;
      }
      const autoUrl = resolveInfluencerProfileUrl(platformResult.platform.slug, acc.username);
      const profileUrl = /^https?:\/\//i.test(acc.profileUrl) ? acc.profileUrl : autoUrl;
      resolvedAccounts.push({
        platformId: platformResult.platform.id,
        username: acc.username,
        profileUrl,
        followerCount: acc.followerCount,
      });
    }
    if (rowError) {
      errors.push({ row: rowNumber, message: rowError });
      continue;
    }

    const categoryResult = await cachedResolveContentCategoryByName(row.contentCategoryName);
    if ("error" in categoryResult) {
      errors.push({ row: rowNumber, message: categoryResult.error });
      continue;
    }

    toCreate.push({
      firstName: row.firstName || null,
      lastName: row.lastName || null,
      email: row.email || null,
      phone: row.phone || null,
      address: row.address || null,
      contentCategoryId: categoryResult.id,
      accounts: resolvedAccounts,
    });
  }

  if (toCreate.length === 0) {
    return { createdCount: 0, errors };
  }

  const created = await prisma.$transaction(
    toCreate.map((data) =>
      prisma.influencer.create({
        data: { ...data, recordDate: new Date(), accounts: { create: data.accounts } },
        select: { id: true },
      })
    )
  );

  await logAudit({
    actorId: session.userId,
    action: "CREATE",
    entityType: "Influencer",
    entityId: `bulk-import:${created.length}`,
    diff: { importedIds: created.map((c) => c.id) },
  });

  revalidatePath("/admin/crm");
  return { createdCount: created.length, errors };
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
