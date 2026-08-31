import { z } from "zod";

export const PageSeoSchema = z.object({
  seoTitle: z.union([z.string().trim().max(70), z.literal("")]).optional(),
  seoDescription: z.union([z.string().trim().max(200), z.literal("")]).optional(),
  seoKeywords: z.union([z.string().trim().max(300), z.literal("")]).optional(),
});

export type PageSeoFormState =
  | { errors?: Record<string, string[]>; message?: string; success?: boolean }
  | undefined;

// generateMetadata()'da kullanılan route eşlemesi — bkz. app/(public)/**/page.tsx.
export const PAGE_ROUTE: Record<string, string> = {
  home: "/",
  about: "/about",
  products: "/products",
  projects: "/projects",
  references: "/references",
  services: "/services",
  career: "/career",
  contact: "/contact",
  blog: "/blog",
};
