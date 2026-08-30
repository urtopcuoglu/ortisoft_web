import Link from "next/link";
import type { Metadata } from "next";
import { Rss, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import BlogPostGrid from "@/components/BlogPostGrid";
import { listPublishedPostsPaginated, listPublishedTags } from "@/modules/blog/actions";
import { isPageComingSoon } from "@/modules/pages/actions";
import ComingSoonPage from "@/components/ComingSoonPage";

export const metadata: Metadata = {
  title: "Blog | Ortisoft",
  description: "Yazılım, dijital pazarlama ve dijital dönüşüm üzerine yazılarımız.",
};

function pageHref(page: number, category?: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (category) params.set("category", category);
  const qs = params.toString();
  return qs ? `/blog?${qs}` : "/blog";
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  if (await isPageComingSoon("blog")) {
    return <ComingSoonPage pageName="Blog" />;
  }

  const { page: pageParam, category } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [{ posts, totalPages }, tags] = await Promise.all([
    listPublishedPostsPaginated({ page, category }),
    listPublishedTags(),
  ]);

  return (
    <div className="flex flex-col">
      <section className="relative py-24 md:py-32 overflow-hidden animated-gradient">
        <div className="absolute inset-0 grid-pattern" />
        <div className="relative z-10 narrow-container text-center">
          <Badge className="mb-6 bg-white/10 text-white border-white/20">Blog</Badge>
          <h1 className="heading-xl text-white mb-6">
            <span className="gradient-text">Yazılarımız</span>
          </h1>
          <p className="body-lg text-slate-300 max-w-xl mx-auto mb-4">
            Yazılım, dijital pazarlama ve dijital dönüşüm üzerine düşüncelerimiz.
          </p>
          <a
            href="/blog/rss.xml"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <Rss className="w-3.5 h-3.5" /> RSS Feed
          </a>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="page-container">
          {/* Kategori (etiket) filtresi */}
          {tags.length > 0 && (
            <div className="mb-8 flex flex-wrap justify-center gap-2">
              <Link
                href="/blog"
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
                  !category ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                Tümü
              </Link>
              {tags.map((tag) => (
                <Link
                  key={tag}
                  href={pageHref(1, tag)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
                    category === tag ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {posts.length === 0 ? (
            <p className="text-center text-slate-400">
              {category ? `"${category}" kategorisinde yazı bulunamadı.` : "Henüz yazı yayınlanmadı."}
            </p>
          ) : (
            <>
              <BlogPostGrid posts={posts} />

              {/* Sayfalama — sayfa başına 10 yazı */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <Link
                    href={pageHref(Math.max(1, page - 1), category)}
                    aria-disabled={page === 1}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50",
                      page === 1 && "pointer-events-none opacity-30"
                    )}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={pageHref(p, category)}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-semibold transition-colors",
                        p === page
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {p}
                    </Link>
                  ))}
                  <Link
                    href={pageHref(Math.min(totalPages, page + 1), category)}
                    aria-disabled={page === totalPages}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50",
                      page === totalPages && "pointer-events-none opacity-30"
                    )}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
