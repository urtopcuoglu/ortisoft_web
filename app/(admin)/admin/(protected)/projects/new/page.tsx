import type { Metadata } from "next";
import ProjectForm from "@/components/admin/ProjectForm";
import { createProject } from "@/modules/projects/actions";

export const metadata: Metadata = {
  title: "Yeni Proje | Ortisoft Admin",
  robots: { index: false, follow: false },
};

export default function NewProjectPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-extrabold text-slate-900">Yeni Proje</h1>
      <ProjectForm action={createProject} submitLabel="Oluştur" />
    </div>
  );
}
