import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TeamMemberForm from "@/components/admin/TeamMemberForm";
import { getTeamMember, updateTeamMember } from "@/modules/about/actions";

export const metadata: Metadata = {
  title: "Ekip Üyesini Düzenle | Ortisoft Admin",
  robots: { index: false, follow: false },
};

export default async function EditTeamMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await getTeamMember(id);
  if (!member) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-extrabold text-slate-900">
        Ekip Üyesini Düzenle
      </h1>
      <TeamMemberForm
        action={updateTeamMember.bind(null, id)}
        member={member}
      />
    </div>
  );
}
