"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/modules/shared/dal";
import { logAudit } from "@/modules/shared/audit";
import { CareerPostingSchema, type CareerPostingFormState } from "./schema";

const LOCALE = "tr";

/** Public sayfa: sadece yayınlanmış ilanlar, en yeniden eskiye. */
export async function listPublishedCareerPostings() {
  return prisma.careerPosting.findMany({
    where: { locale: LOCALE, status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });
}

/** Admin: tüm durumlardaki ilanlar. */
export async function listAllCareerPostings() {
  return prisma.careerPosting.findMany({
    where: { locale: LOCALE },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCareerPosting(id: string) {
  return prisma.careerPosting.findUnique({ where: { id } });
}

export async function createCareerPosting(
  _prevState: CareerPostingFormState,
  formData: FormData
): Promise<CareerPostingFormState> {
  const session = await verifySession();

  const validated = CareerPostingSchema.safeParse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    description: formData.get("description"),
    requirements: formData.get("requirements") ?? "",
    location: formData.get("location"),
    employmentType: formData.get("employmentType"),
    applyEmail: formData.get("applyEmail"),
    status: formData.get("status"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const existing = await prisma.careerPosting.findUnique({
    where: { locale_slug: { locale: LOCALE, slug: validated.data.slug } },
  });
  if (existing) {
    return { errors: { slug: ["Bu slug zaten kullanılıyor."] } };
  }

  const posting = await prisma.careerPosting.create({
    data: {
      locale: LOCALE,
      ...validated.data,
      publishedAt: validated.data.status === "PUBLISHED" ? new Date() : null,
    },
  });

  await logAudit({
    actorId: session.userId,
    action: "CREATE",
    entityType: "CareerPosting",
    entityId: posting.id,
  });

  revalidatePath("/career");
  revalidatePath("/about");
  revalidatePath("/admin/career");
  return { success: true };
}

export async function updateCareerPosting(
  id: string,
  _prevState: CareerPostingFormState,
  formData: FormData
): Promise<CareerPostingFormState> {
  const session = await verifySession();

  const validated = CareerPostingSchema.safeParse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    description: formData.get("description"),
    requirements: formData.get("requirements") ?? "",
    location: formData.get("location"),
    employmentType: formData.get("employmentType"),
    applyEmail: formData.get("applyEmail"),
    status: formData.get("status"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const existing = await prisma.careerPosting.findUnique({
    where: { locale_slug: { locale: LOCALE, slug: validated.data.slug } },
  });
  if (existing && existing.id !== id) {
    return { errors: { slug: ["Bu slug zaten kullanılıyor."] } };
  }

  const current = await prisma.careerPosting.findUnique({ where: { id } });

  await prisma.careerPosting.update({
    where: { id },
    data: {
      ...validated.data,
      // İlk kez PUBLISHED durumuna geçiyorsa publishedAt damgalanır; sonrasında korunur.
      publishedAt:
        validated.data.status === "PUBLISHED"
          ? (current?.publishedAt ?? new Date())
          : current?.publishedAt ?? null,
    },
  });

  await logAudit({
    actorId: session.userId,
    action: "UPDATE",
    entityType: "CareerPosting",
    entityId: id,
  });

  revalidatePath("/career");
  revalidatePath("/about");
  revalidatePath("/admin/career");
  return { success: true };
}

export async function deleteCareerPosting(id: string) {
  const session = await verifySession();

  await prisma.careerPosting.delete({ where: { id } });

  await logAudit({
    actorId: session.userId,
    action: "DELETE",
    entityType: "CareerPosting",
    entityId: id,
  });

  revalidatePath("/career");
  revalidatePath("/about");
  revalidatePath("/admin/career");
}
