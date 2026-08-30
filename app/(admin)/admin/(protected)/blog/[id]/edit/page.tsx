import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogPostForm from "@/components/admin/BlogPostForm";
import { getPost, updatePost } from "@/modules/blog/actions";

export const metadata: Metadata = {
  title: "Yazıyı Düzenle | Ortisoft Admin",
  robots: { index: false, follow: false },
};

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-extrabold text-slate-900">Yazıyı Düzenle</h1>
      <BlogPostForm action={updatePost.bind(null, id)} post={post} />
    </div>
  );
}
