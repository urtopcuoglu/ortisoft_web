"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/modules/shared/dal";
import { logAudit } from "@/modules/shared/audit";
import { GuideContactSchema, NEW_CATEGORY_VALUE, type GuideContactFormState } from "./schema";

export async function listGuideContacts() {
  await verifySession();
  return prisma.guideContact.findMany({
    orderBy: { recordDate: "desc" },
    include: {
      category: { select: { id: true, name: true } },
      relatedUser: { select: { id: true, name: true } },
    },
  });
}

export async function listGuideCategories() {
  await verifySession();
  return prisma.guideCategory.findMany({ orderBy: { name: "asc" } });
}

/** İlgili kişi dropdown'ı — doğrudan kullanıcılar listesinden çekilir. */
export async function listGuideUsers() {
  await verifySession();
  return prisma.user.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
}

/**
 * Kategori dropdown'ında "+ Yeni kategori ekle" seçilip yeni bir ad
 * girildiyse önce o kategoriyi oluşturur (aynı ad zaten varsa, büyük/küçük
 * harf duyarsız olarak mevcut kaydı kullanır — yanlışlıkla ikinci "Bina
 * Malzeme" gibi bir kopya açılmasın diye).
 */
async function resolveCategoryId(formData: FormData): Promise<{ id: string } | { error: string }> {
  const categoryId = String(formData.get("categoryId") ?? "");

  if (categoryId === NEW_CATEGORY_VALUE) {
    const name = String(formData.get("newCategoryName") ?? "").trim();
    if (name.length < 2) {
      return { error: "Yeni kategori adı en az 2 karakter olmalı." };
    }
    const existing = await prisma.guideCategory.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });
    if (existing) return { id: existing.id };
    const created = await prisma.guideCategory.create({ data: { name } });
    return { id: created.id };
  }

  if (!categoryId) {
    return { error: "Kategori seçin." };
  }
  return { id: categoryId };
}

export async function createGuideContact(
  _prevState: GuideContactFormState,
  formData: FormData
): Promise<GuideContactFormState> {
  const session = await verifySession();

  const categoryResult = await resolveCategoryId(formData);
  if ("error" in categoryResult) {
    return { errors: { categoryId: [categoryResult.error] } };
  }

  const validated = GuideContactSchema.safeParse({
    companyName: formData.get("companyName"),
    authorizedPerson: formData.get("authorizedPerson"),
    phone: formData.get("phone"),
    address: formData.get("address") ?? "",
    email: formData.get("email"),
    website: formData.get("website") ?? "",
    relatedUserId: formData.get("relatedUserId") ?? "",
    relationType: formData.get("relationType"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const contact = await prisma.guideContact.create({
    data: {
      companyName: validated.data.companyName,
      authorizedPerson: validated.data.authorizedPerson,
      categoryId: categoryResult.id,
      phone: validated.data.phone,
      address: validated.data.address || null,
      email: validated.data.email,
      website: validated.data.website || null,
      relatedUserId: validated.data.relatedUserId || null,
      relationType: validated.data.relationType,
      // Kayıt tarihi modalde alan olarak sorulmaz, kayıt anında otomatik basılır
      // (bkz. lib/utils.ts#formatGunAyYil — listede gün_ay_yıl olarak gösterilir).
      recordDate: new Date(),
      // Doğrudan aktif müşteri olarak eklendiyse, "ne zaman aktif oldu"
      // raporlaması için o anı da işaretle (bkz. CRM Bölüm 10.1).
      becameActiveAt: validated.data.relationType === "AKTIF_MUSTERI" ? new Date() : null,
    },
  });

  await logAudit({
    actorId: session.userId,
    action: "CREATE",
    entityType: "GuideContact",
    entityId: contact.id,
  });

  revalidatePath("/admin/crm");
  return { success: true, message: "Kayıt eklendi." };
}

export async function updateGuideContact(
  id: string,
  _prevState: GuideContactFormState,
  formData: FormData
): Promise<GuideContactFormState> {
  const session = await verifySession();

  const categoryResult = await resolveCategoryId(formData);
  if ("error" in categoryResult) {
    return { errors: { categoryId: [categoryResult.error] } };
  }

  const validated = GuideContactSchema.safeParse({
    companyName: formData.get("companyName"),
    authorizedPerson: formData.get("authorizedPerson"),
    phone: formData.get("phone"),
    address: formData.get("address") ?? "",
    email: formData.get("email"),
    website: formData.get("website") ?? "",
    relatedUserId: formData.get("relatedUserId") ?? "",
    relationType: formData.get("relationType"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  // Potansiyel müşteri ilk kez AKTIF_MUSTERI'ye geçiyorsa becameActiveAt
  // basılır; zaten aktifse (ya da hiç aktif olmadıysa) dokunulmaz — alanı
  // hiç yazmadan (undefined) DB'deki mevcut değeri korumak için önce mevcut
  // kaydı kontrol ediyoruz.
  const existing = await prisma.guideContact.findUnique({ where: { id }, select: { becameActiveAt: true } });
  const becameActiveAt =
    validated.data.relationType === "AKTIF_MUSTERI" && !existing?.becameActiveAt ? new Date() : undefined;

  await prisma.guideContact.update({
    where: { id },
    data: {
      companyName: validated.data.companyName,
      authorizedPerson: validated.data.authorizedPerson,
      categoryId: categoryResult.id,
      phone: validated.data.phone,
      address: validated.data.address || null,
      email: validated.data.email,
      website: validated.data.website || null,
      relatedUserId: validated.data.relatedUserId || null,
      relationType: validated.data.relationType,
      ...(becameActiveAt ? { becameActiveAt } : {}),
      // recordDate kasıtlı olarak değiştirilmiyor — ilk kayıt anı korunur.
    },
  });

  await logAudit({
    actorId: session.userId,
    action: "UPDATE",
    entityType: "GuideContact",
    entityId: id,
  });

  revalidatePath("/admin/crm");
  return { success: true, message: "Kaydedildi." };
}

export async function deleteGuideContact(id: string) {
  const session = await verifySession();

  try {
    await prisma.guideContact.delete({ where: { id } });
  } catch {
    // CRM alt-kayıtları (görüşme/teklif/sözleşme/ödeme) varken silme
    // Restrict ile DB seviyesinde engellenir (bkz. prisma/schema.prisma) —
    // bilinçli: geçmiş kayıtlar yanlışlıkla kaybolmasın, silmek yerine
    // relationType PASIF_MUSTERI'ye çekilsin.
    throw new Error(
      "Bu firma silinemedi — altında görüşme/teklif/sözleşme/ödeme kaydı var. Önce onları silin ya da bu firmayı \"Pasif Müşteri\" yapın."
    );
  }

  await logAudit({
    actorId: session.userId,
    action: "DELETE",
    entityType: "GuideContact",
    entityId: id,
  });

  revalidatePath("/admin/crm");
}
