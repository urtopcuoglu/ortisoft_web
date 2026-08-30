import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const SITE_URL = "https://ortisoft.com.tr";

const STATIC_ROUTES = [
  "", "about", "services", "products", "projects",
  "references", "career", "contact", "blog",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, contracts] = await Promise.all([
    prisma.blogPost.findMany({
      where: { locale: "tr", status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.contract.findMany({ select: { slug: true, updatedAt: true } }),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}/${route}`.replace(/\/$/, "") || SITE_URL,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const contractEntries: MetadataRoute.Sitemap = contracts.map((contract) => ({
    url: `${SITE_URL}/contracts/${contract.slug}`,
    lastModified: contract.updatedAt,
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  return [...staticEntries, ...postEntries, ...contractEntries];
}
