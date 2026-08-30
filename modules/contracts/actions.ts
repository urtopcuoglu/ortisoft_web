"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/modules/shared/dal";
import { logAudit } from "@/modules/shared/audit";
import { ContractSchema, type ContractFormState } from "./schema";

/** Footer ve /contracts sayfaları için — herkes erişebilir, oturum gerektirmez. */
export async function listContracts() {
  return prisma.contract.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getContractBySlug(slug: string) {
  return prisma.contract.findUnique({ where: { slug } });
}

/** Admin */
export async function getContract(id: string) {
  return prisma.contract.findUnique({ where: { id } });
}

function revalidateAll(slug?: string) {
  revalidatePath("/admin/contracts");
  revalidatePath("/", "layout"); // Footer tüm sayfalarda göründüğü için
  if (slug) revalidatePath(`/contracts/${slug}`);
}

export async function createContract(
  _prevState: ContractFormState,
  formData: FormData
): Promise<ContractFormState> {
  const session = await verifySession();

  const validated = ContractSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    content: formData.get("content"),
    sortOrder: formData.get("sortOrder") ?? 0,
  });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const existing = await prisma.contract.findUnique({ where: { slug: validated.data.slug } });
  if (existing) {
    return { errors: { slug: ["Bu slug zaten kullanılıyor."] } };
  }

  const contract = await prisma.contract.create({ data: validated.data });

  await logAudit({
    actorId: session.userId,
    action: "CREATE",
    entityType: "Contract",
    entityId: contract.id,
  });

  revalidateAll(contract.slug);
  return { success: true };
}

export async function updateContract(
  id: string,
  _prevState: ContractFormState,
  formData: FormData
): Promise<ContractFormState> {
  const session = await verifySession();

  const validated = ContractSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    content: formData.get("content"),
    sortOrder: formData.get("sortOrder") ?? 0,
  });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const existing = await prisma.contract.findUnique({ where: { slug: validated.data.slug } });
  if (existing && existing.id !== id) {
    return { errors: { slug: ["Bu slug zaten kullanılıyor."] } };
  }

  await prisma.contract.update({ where: { id }, data: validated.data });

  await logAudit({
    actorId: session.userId,
    action: "UPDATE",
    entityType: "Contract",
    entityId: id,
  });

  revalidateAll(validated.data.slug);
  return { success: true };
}

export async function deleteContract(id: string) {
  const session = await verifySession();

  const deleted = await prisma.contract.delete({ where: { id } });

  await logAudit({
    actorId: session.userId,
    action: "DELETE",
    entityType: "Contract",
    entityId: id,
  });

  revalidateAll(deleted.slug);
}
