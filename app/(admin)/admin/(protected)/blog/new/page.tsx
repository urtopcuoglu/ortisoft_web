import type { Metadata } from "next";
import BlogPostForm from "@/components/admin/BlogPostForm";
import { createPost } from "@/modules/blog/actions";

export const metadata: Metadata = {
  title: "Yeni Yazı | Ortisoft Admin",
  robots: { index: false, follow: false },
};

export default function NewBlogPostPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-extrabold text-slate-900">Yeni Blog Yazısı</h1>
      <BlogPostForm action={createPost} submitLabel="Oluştur" />
    </div>
  );
}
