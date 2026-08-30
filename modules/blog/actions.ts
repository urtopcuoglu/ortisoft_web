"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/modules/shared/dal";
import { logAudit } from "@/modules/shared/audit";
import { BlogPostSchema, type BlogPostFormState } from "./schema";

const LOCALE = "tr";

/** Public: sadece yayınlanmış yazılar, en yeniden eskiye (sitemap/RSS için — tamamı). */
export async function listPublishedPosts() {
  return prisma.blogPost.findMany({
    where: { locale: LOCALE, status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });
}

const POSTS_PER_PAGE = 10;

/**
 * Public blog listeleme sayfası için — sayfa başına 10 yazı, opsiyonel
 * kategori (etiket) filtresi. `tags` bir Json dizisi olduğundan Prisma'nın
 * `array_contains` operatörüyle filtreleniyor.
 */
export async function listPublishedPostsPaginated({
  page = 1,
  category,
}: {
  page?: number;
  category?: string;
} = {}) {
  const where = {
    locale: LOCALE,
    status: "PUBLISHED" as const,
    ...(category ? { tags: { array_contains: category } } : {}),
  };

  const [posts, totalCount] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * POSTS_PER_PAGE,
      take: POSTS_PER_PAGE,
    }),
    prisma.blogPost.count({ where }),
  ]);

  return {
    posts,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / POSTS_PER_PAGE)),
    page,
  };
}

/** Kategori (etiket) filtre pill'leri için — yayındaki tüm yazılardan benzersiz etiketler. */
export async function listPublishedTags() {
  const posts = await prisma.blogPost.findMany({
    where: { locale: LOCALE, status: "PUBLISHED" },
    select: { tags: true },
  });

  const tagSet = new Set<string>();
  for (const post of posts) {
    if (Array.isArray(post.tags)) {
      for (const tag of post.tags as string[]) tagSet.add(tag);
    }
  }
  return Array.from(tagSet).sort((a, b) => a.localeCompare(b, "tr"));
}

export async function getPublishedPostBySlug(slug: string) {
  return prisma.blogPost.findFirst({
    where: { locale: LOCALE, slug, status: "PUBLISHED" },
  });
}

/** Admin: tüm yazılar (taslak dahil). */
export async function listAllPosts() {
  return prisma.blogPost.findMany({
    where: { locale: LOCALE },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPost(id: string) {
  return prisma.blogPost.findUnique({ where: { id } });
}

function readFormData(formData: FormData) {
  return {
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    coverImage: formData.get("coverImage") ?? "",
    tags: formData.get("tags") ?? "",
    status: formData.get("status"),
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
    focusKeyword: formData.get("focusKeyword") ?? "",
  };
}

function revalidateAll(slug?: string) {
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/blog/${slug}`);
}

export async function createPost(
  _prevState: BlogPostFormState,
  formData: FormData
): Promise<BlogPostFormState> {
  const session = await verifySession();

  const validated = BlogPostSchema.safeParse(readFormData(formData));
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const existing = await prisma.blogPost.findUnique({
    where: { locale_slug: { locale: LOCALE, slug: validated.data.slug } },
  });
  if (existing) {
    return { errors: { slug: ["Bu slug zaten kullanılıyor."] } };
  }

  const post = await prisma.blogPost.create({
    data: {
      locale: LOCALE,
      ...validated.data,
      authorId: session.userId,
      publishedAt: validated.data.status === "PUBLISHED" ? new Date() : null,
    },
  });

  await logAudit({
    actorId: session.userId,
    action: "CREATE",
    entityType: "BlogPost",
    entityId: post.id,
  });

  revalidateAll(post.slug);
  return { success: true };
}

export async function updatePost(
  id: string,
  _prevState: BlogPostFormState,
  formData: FormData
): Promise<BlogPostFormState> {
  const session = await verifySession();

  const validated = BlogPostSchema.safeParse(readFormData(formData));
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const existing = await prisma.blogPost.findUnique({
    where: { locale_slug: { locale: LOCALE, slug: validated.data.slug } },
  });
  if (existing && existing.id !== id) {
    return { errors: { slug: ["Bu slug zaten kullanılıyor."] } };
  }

  const current = await prisma.blogPost.findUnique({ where: { id } });

  await prisma.blogPost.update({
    where: { id },
    data: {
      ...validated.data,
      publishedAt:
        validated.data.status === "PUBLISHED"
          ? (current?.publishedAt ?? new Date())
          : (current?.publishedAt ?? null),
    },
  });

  await logAudit({
    actorId: session.userId,
    action: "UPDATE",
    entityType: "BlogPost",
    entityId: id,
  });

  revalidateAll(validated.data.slug);
  return { success: true };
}

export async function deletePost(id: string) {
  const session = await verifySession();

  const deleted = await prisma.blogPost.delete({ where: { id } });

  await logAudit({
    actorId: session.userId,
    action: "DELETE",
    entityType: "BlogPost",
    entityId: id,
  });

  revalidateAll(deleted.slug);
}
