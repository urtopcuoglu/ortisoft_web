"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowRight, LayoutGrid, Rows3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@/lib/generated/prisma/client";

function formatDate(date: Date | null) {
  if (!date) return "";
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "long", year: "numeric" }).format(date);
}

function tagsOf(post: BlogPost) {
  return Array.isArray(post.tags) ? (post.tags as string[]) : [];
}

export default function BlogPostGrid({ posts }: { posts: BlogPost[] }) {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <div>
      <div className="mb-8 flex justify-end gap-1.5">
        <button
          type="button"
          onClick={() => setView("grid")}
          aria-label="Izgara görünümü"
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg border transition-colors",
            view === "grid" ? "border-blue-200 bg-blue-50 text-blue-600" : "border-slate-200 text-slate-400 hover:bg-slate-50"
          )}
        >
          <LayoutGrid className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setView("list")}
          aria-label="Liste görünümü"
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg border transition-colors",
            view === "list" ? "border-blue-200 bg-blue-50 text-blue-600" : "border-slate-200 text-slate-400 hover:bg-slate-50"
          )}
        >
          <Rows3 className="h-4 w-4" />
        </button>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => {
            const tags = tagsOf(post);
            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white hover:border-blue-200 hover:shadow-xl transition-all duration-300"
              >
                {post.coverImage && (
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  {tags.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <h3 className="mb-2 text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-500">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> {formatDate(post.publishedAt)}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Devamını Oku <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white">
          {posts.map((post) => {
            const tags = tagsOf(post);
            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col gap-4 p-6 hover:bg-slate-50 transition-colors sm:flex-row sm:items-center"
              >
                {post.coverImage && (
                  <div className="relative h-32 w-full flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-20 sm:w-32">
                    <Image src={post.coverImage} alt={post.title} fill sizes="128px" className="object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  {tags.length > 0 && (
                    <div className="mb-1.5 flex flex-wrap gap-1.5">
                      {tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <h3 className="mb-1 text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="mb-2 text-sm text-slate-500 line-clamp-1">{post.excerpt}</p>
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5" /> {formatDate(post.publishedAt)}
                  </span>
                </div>
                <ArrowRight className="hidden h-4 w-4 flex-shrink-0 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity sm:block" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
