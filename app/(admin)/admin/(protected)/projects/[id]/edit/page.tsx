import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectForm from "@/components/admin/ProjectForm";
import { getProject, updateProject } from "@/modules/projects/actions";

export const metadata: Metadata = {
  title: "Projeyi Düzenle | Ortisoft Admin",
  robots: { index: false, follow: false },
};

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-extrabold text-slate-900">Projeyi Düzenle</h1>
      <ProjectForm action={updateProject.bind(null, id)} project={project} />
    </div>
  );
}
