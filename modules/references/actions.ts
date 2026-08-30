"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/modules/shared/dal";
import { logAudit } from "@/modules/shared/audit";
import { ReferenceSchema, type ReferenceFormState } from "./schema";

const LOCALE = "tr";

export async function listReferences() {
  return prisma.reference.findMany({
    where: { locale: LOCALE },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getReference(id: string) {
  return prisma.reference.findUnique({ where: { id } });
}

export async function createReference(
  _prevState: ReferenceFormState,
  formData: FormData
): Promise<ReferenceFormState> {
  const session = await verifySession();

  const validated = ReferenceSchema.safeParse({
    clientName: formData.get("clientName"),
    description: formData.get("description"),
    logoUrl: formData.get("logoUrl") ?? "",
    projectLink: formData.get("projectLink") ?? "",
    sortOrder: formData.get("sortOrder") ?? 0,
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const reference = await prisma.reference.create({
    data: { locale: LOCALE, ...validated.data },
  });

  await logAudit({
    actorId: session.userId,
    action: "CREATE",
    entityType: "Reference",
    entityId: reference.id,
  });

  revalidatePath("/references");
  revalidatePath("/about");
  revalidatePath("/admin/references");
  return { success: true };
}

export async function updateReference(
  id: string,
  _prevState: ReferenceFormState,
  formData: FormData
): Promise<ReferenceFormState> {
  const session = await verifySession();

  const validated = ReferenceSchema.safeParse({
    clientName: formData.get("clientName"),
    description: formData.get("description"),
    logoUrl: formData.get("logoUrl") ?? "",
    projectLink: formData.get("projectLink") ?? "",
    sortOrder: formData.get("sortOrder") ?? 0,
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  await prisma.reference.update({ where: { id }, data: validated.data });

  await logAudit({
    actorId: session.userId,
    action: "UPDATE",
    entityType: "Reference",
    entityId: id,
  });

  revalidatePath("/references");
  revalidatePath("/about");
  revalidatePath("/admin/references");
  return { success: true };
}

export async function deleteReference(id: string) {
  const session = await verifySession();

  await prisma.reference.delete({ where: { id } });

  await logAudit({
    actorId: session.userId,
    action: "DELETE",
    entityType: "Reference",
    entityId: id,
  });

  revalidatePath("/references");
  revalidatePath("/about");
  revalidatePath("/admin/references");
}
