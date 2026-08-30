"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/modules/shared/dal";
import { logAudit } from "@/modules/shared/audit";
import { ServiceSchema, type ServiceFormState } from "./schema";

const LOCALE = "tr";

export async function listServices() {
  return prisma.service.findMany({
    where: { locale: LOCALE },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getService(id: string) {
  return prisma.service.findUnique({ where: { id } });
}

function parseServiceForm(formData: FormData) {
  return ServiceSchema.safeParse({
    slug: formData.get("slug"),
    icon: formData.get("icon"),
    tag: formData.get("tag"),
    title: formData.get("title"),
    description: formData.get("description"),
    colorTheme: formData.get("colorTheme"),
    sortOrder: formData.get("sortOrder") ?? 0,
    pricingCurrency: formData.get("pricingCurrency") ?? "TRY",
    subServicesJson: formData.get("subServicesJson") ?? "[]",
  });
}

export async function createService(
  _prevState: ServiceFormState,
  formData: FormData
): Promise<ServiceFormState> {
  const session = await verifySession();

  const validated = parseServiceForm(formData);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const existing = await prisma.service.findUnique({
    where: { locale_slug: { locale: LOCALE, slug: validated.data.slug } },
  });
  if (existing) {
    return { errors: { slug: ["Bu slug zaten kullanılıyor."] } };
  }

  const { subServicesJson, ...rest } = validated.data;
  const service = await prisma.service.create({
    data: { locale: LOCALE, ...rest, subServices: subServicesJson },
  });

  await logAudit({
    actorId: session.userId,
    action: "CREATE",
    entityType: "Service",
    entityId: service.id,
  });

  revalidatePath("/services");
  revalidatePath("/admin/services");
  return { success: true };
}

export async function updateService(
  id: string,
  _prevState: ServiceFormState,
  formData: FormData
): Promise<ServiceFormState> {
  const session = await verifySession();

  const validated = parseServiceForm(formData);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const existing = await prisma.service.findUnique({
    where: { locale_slug: { locale: LOCALE, slug: validated.data.slug } },
  });
  if (existing && existing.id !== id) {
    return { errors: { slug: ["Bu slug zaten kullanılıyor."] } };
  }

  const { subServicesJson, ...rest } = validated.data;
  await prisma.service.update({
    where: { id },
    data: { ...rest, subServices: subServicesJson },
  });

  await logAudit({
    actorId: session.userId,
    action: "UPDATE",
    entityType: "Service",
    entityId: id,
  });

  revalidatePath("/services");
  revalidatePath("/admin/services");
  return { success: true };
}

export async function deleteService(id: string) {
  const session = await verifySession();

  await prisma.service.delete({ where: { id } });

  await logAudit({
    actorId: session.userId,
    action: "DELETE",
    entityType: "Service",
    entityId: id,
  });

  revalidatePath("/services");
  revalidatePath("/admin/services");
}
