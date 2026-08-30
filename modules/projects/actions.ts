"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { verifySession } from "@/modules/shared/dal";
import { logAudit } from "@/modules/shared/audit";
import { ProjectSchema, type ProjectFormState } from "./schema";

const LOCALE = "tr";

// Prisma'da Json? alanına SQL NULL yazmak için düz `null` değil, bu sentinel gerekir.
function toJsonInput(value: string[] | null) {
  return value ?? Prisma.JsonNull;
}

export async function listProjects() {
  return prisma.project.findMany({
    where: { locale: LOCALE },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getProject(id: string) {
  return prisma.project.findUnique({ where: { id } });
}

function readFormData(formData: FormData) {
  return {
    slug: formData.get("slug"),
    title: formData.get("title"),
    status: formData.get("status"),
    fundingLabel: formData.get("fundingLabel"),
    tagline: formData.get("tagline"),
    description: formData.get("description"),
    tags: formData.get("tags") ?? "",
    icon: formData.get("icon"),
    colorTheme: formData.get("colorTheme"),
    features: formData.get("features") ?? "",
    techStack: formData.get("techStack") ?? "",
    sortOrder: formData.get("sortOrder") ?? 0,
  };
}

export async function createProject(
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const session = await verifySession();

  const validated = ProjectSchema.safeParse(readFormData(formData));
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const existing = await prisma.project.findUnique({
    where: { locale_slug: { locale: LOCALE, slug: validated.data.slug } },
  });
  if (existing) {
    return { errors: { slug: ["Bu slug zaten kullanılıyor."] } };
  }

  const project = await prisma.project.create({
    data: {
      locale: LOCALE,
      ...validated.data,
      techStack: toJsonInput(validated.data.techStack),
    },
  });

  await logAudit({
    actorId: session.userId,
    action: "CREATE",
    entityType: "Project",
    entityId: project.id,
  });

  revalidatePath("/projects");
  revalidatePath("/admin/projects");
  return { success: true };
}

export async function updateProject(
  id: string,
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const session = await verifySession();

  const validated = ProjectSchema.safeParse(readFormData(formData));
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const existing = await prisma.project.findUnique({
    where: { locale_slug: { locale: LOCALE, slug: validated.data.slug } },
  });
  if (existing && existing.id !== id) {
    return { errors: { slug: ["Bu slug zaten kullanılıyor."] } };
  }

  await prisma.project.update({
    where: { id },
    data: {
      ...validated.data,
      techStack: toJsonInput(validated.data.techStack),
    },
  });

  await logAudit({
    actorId: session.userId,
    action: "UPDATE",
    entityType: "Project",
    entityId: id,
  });

  revalidatePath("/projects");
  revalidatePath("/admin/projects");
  return { success: true };
}

export async function deleteProject(id: string) {
  const session = await verifySession();

  await prisma.project.delete({ where: { id } });

  await logAudit({
    actorId: session.userId,
    action: "DELETE",
    entityType: "Project",
    entityId: id,
  });

  revalidatePath("/projects");
  revalidatePath("/admin/projects");
}
