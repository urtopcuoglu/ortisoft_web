"use client";

import { useActionState, useState } from "react";
import RichTextEditor from "@/components/admin/RichTextEditor";
import SeoAnalyzer from "@/components/admin/SeoAnalyzer";
import type { BlogPostFormState } from "@/modules/blog/schema";
import type { BlogPost } from "@/lib/generated/prisma/client";

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20";

type Action = (
  state: BlogPostFormState,
  formData: FormData
) => Promise<BlogPostFormState>;

function toLines(value: unknown): string {
  return Array.isArray(value) ? (value as string[]).join("\n") : "";
}

export default function BlogPostForm({
  action,
  post,
  submitLabel = "Kaydet",
}: {
  action: Action;
  post?: BlogPost;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  // SEO Analiz Aracı'nın canlı güncellenmesi için lift edilen alanlar.
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(post?.seoDescription ?? "");
  const [focusKeyword, setFocusKeyword] = useState(post?.focusKeyword ?? "");

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
      <form action={formAction} className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Başlık</label>
            <input
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              required
            />
            {state?.errors?.title && <p className="mt-1 text-xs text-red-600">{state.errors.title[0]}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Slug <span className="font-normal text-slate-400 dark:text-slate-500">(URL: /blog/…)</span>
            </label>
            <input
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={inputClass}
              required
            />
            {state?.errors?.slug && <p className="mt-1 text-xs text-red-600">{state.errors.slug[0]}</p>}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Özet <span className="font-normal text-slate-400 dark:text-slate-500">(liste kartlarında görünür)</span>
          </label>
          <textarea name="excerpt" rows={2} defaultValue={post?.excerpt} className={inputClass} required />
          {state?.errors?.excerpt && <p className="mt-1 text-xs text-red-600">{state.errors.excerpt[0]}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">İçerik</label>
          <RichTextEditor name="content" defaultValue={post?.content} />
          {state?.errors?.content && <p className="mt-1 text-xs text-red-600">{state.errors.content[0]}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Kapak Görseli URL&apos;si <span className="font-normal text-slate-400 dark:text-slate-500">(opsiyonel)</span>
            </label>
            <input name="coverImage" defaultValue={post?.coverImage ?? ""} className={inputClass} />
            {state?.errors?.coverImage && <p className="mt-1 text-xs text-red-600">{state.errors.coverImage[0]}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Durum</label>
            <select name="status" defaultValue={post?.status ?? "DRAFT"} className={inputClass}>
              <option value="DRAFT">Taslak</option>
              <option value="SCHEDULED">Planlandı</option>
              <option value="PUBLISHED">Yayında</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Etiketler <span className="font-normal text-slate-400 dark:text-slate-500">(her satıra bir tane)</span>
          </label>
          <textarea name="tags" rows={2} defaultValue={toLines(post?.tags)} className={inputClass} />
        </div>

        <div className="rounded-xl border border-blue-100 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-500/10 p-4">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400">SEO Alanları</h3>
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                SEO Başlığı <span className="font-normal text-slate-400 dark:text-slate-500">(boşsa üstteki başlık kullanılır)</span>
              </label>
              <input
                name="seoTitle"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Meta Açıklama</label>
              <textarea
                name="seoDescription"
                rows={2}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Odak Anahtar Kelime</label>
              <input
                name="focusKeyword"
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {state?.success && (
          <p className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 px-3.5 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">Kaydedildi.</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-fit rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {pending ? "Kaydediliyor…" : submitLabel}
        </button>
      </form>

      <div className="xl:sticky xl:top-6 xl:self-start">
        <SeoAnalyzer
          path={`blog/${slug || "yazi-basligi"}`}
          title={title}
          seoTitle={seoTitle}
          description={seoDescription}
          focusKeyword={focusKeyword}
          slug={slug}
        />
      </div>
    </div>
  );
}
