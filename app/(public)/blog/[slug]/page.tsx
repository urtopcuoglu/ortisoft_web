import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getPublishedPostBySlug } from "@/modules/blog/actions";

const SITE_URL = "https://ortisoft.com.tr";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return { title: "Yazı Bulunamadı | Ortisoft" };

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const url = `${SITE_URL}/blog/${post.slug}`;

  return {
    title: `${title} | Ortisoft Blog`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

function formatDate(date: Date | null) {
  if (!date) return "";
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "long", year: "numeric" }).format(date);
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const tags = Array.isArray(post.tags) ? (post.tags as string[]) : [];
  const url = `${SITE_URL}/blog/${post.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    image: post.coverImage || undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Organization", name: "Ortisoft" },
    publisher: { "@type": "Organization", name: "Ortisoft" },
    mainEntityOfPage: url,
  };

  return (
    <div className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="relative py-24 md:py-32 overflow-hidden animated-gradient">
        <div className="absolute inset-0 grid-pattern" />
        <div className="relative z-10 narrow-container text-center">
          <Badge className="mb-6 bg-white/10 text-white border-white/20">Blog</Badge>
          <h1 className="heading-lg text-white mb-5">
            <span className="gradient-text">{post.title}</span>
          </h1>
          <p className="flex items-center justify-center gap-2 text-sm text-slate-300">
            <Calendar className="w-4 h-4" /> {formatDate(post.publishedAt)}
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="narrow-container">
          {post.coverImage && (
            <div className="relative mb-10 h-72 w-full overflow-hidden rounded-2xl bg-slate-100 md:h-96">
              <Image src={post.coverImage} alt={post.title} fill sizes="100vw" className="object-cover" />
            </div>
          )}

          {tags.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div
            className="text-sm leading-relaxed text-slate-600 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-4 [&_p]:leading-7 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_a]:text-blue-600 [&_a]:underline [&_img]:rounded-xl"
            // NOT: content sadece admin panelinden (tek admin hesabı) Tiptap
            // editörüyle yazılır — kullanıcı girdisi değildir.
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </section>
    </div>
  );
}
