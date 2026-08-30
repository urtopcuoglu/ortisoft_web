import type { Metadata } from "next";
import TeamMemberForm from "@/components/admin/TeamMemberForm";
import { createTeamMember } from "@/modules/about/actions";

export const metadata: Metadata = {
  title: "Yeni Ekip Üyesi | Ortisoft Admin",
  robots: { index: false, follow: false },
};

export default function NewTeamMemberPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-extrabold text-slate-900 dark:text-white">Yeni Ekip Üyesi</h1>
      <TeamMemberForm action={createTeamMember} submitLabel="Oluştur" />
    </div>
  );
}
