import type { MetadataRoute } from "next";

const SITE_URL = "https://ortisoft.com.tr";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/admin" },
    host: SITE_URL,
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
