import type { Metadata } from "next";
import { Suspense } from "react";
import { listGuideContacts, listGuideCategories, listGuideUsers } from "@/modules/guide/actions";
import { listInfluencers, listInfluencerPlatforms, listInfluencerContentCategories } from "@/modules/influencer/actions";
import { listTasks, listTaskColumns, listTaskLabels, listTaskUsers, listTaskRequestTypes } from "@/modules/tasks/actions";
import { listPortfolioCustomers, listPortfolioContactStatuses } from "@/modules/portfolio/actions";
import { listServices } from "@/modules/services/actions";
import { getCurrentUser } from "@/modules/shared/dal";
import GuideTable from "@/components/admin/GuideTable";
import InfluencerTable from "@/components/admin/influencer/InfluencerTable";
import CrmSectionTabs from "@/components/admin/crm/CrmSectionTabs";
import PortfolioTable from "@/components/admin/portfolio/PortfolioTable";
import TasksViewSwitcher from "@/components/admin/tasks/TasksViewSwitcher";

export const metadata: Metadata = {
  title: "CRM | Ortisoft Admin",
  robots: { index: false, follow: false },
};

export default async function AdminCrmPage() {
  const [
    contacts,
    categories,
    users,
    influencers,
    influencerPlatforms,
    influencerContentCategories,
    tasks,
    taskColumns,
    taskLabels,
    taskUsers,
    taskRequestTypes,
    currentUser,
    portfolioCustomers,
    portfolioStatuses,
    services,
  ] = await Promise.all([
    listGuideContacts(),
    listGuideCategories(),
    listGuideUsers(),
    listInfluencers(),
    listInfluencerPlatforms(),
    listInfluencerContentCategories(),
    listTasks(),
    listTaskColumns(),
    listTaskLabels(),
    listTaskUsers(),
    listTaskRequestTypes(),
    getCurrentUser(),
    listPortfolioCustomers(),
    listPortfolioContactStatuses(),
    listServices(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">CRM</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Mevcut/potansiyel/eski müşteriler, çözüm ortakları, tedarikçiler ve influencer&apos;lar — firma adına
          tıklayıp görüşme notu, teklif, sözleşme ve ödeme geçmişini görebilirsiniz.
        </p>
      </div>

      {/* CrmSectionTabs ve (içindeki) TasksBoard useSearchParams() kullanıyor
          (sekme + görev deep-link'i "?tab=tasks&task=" için, bkz. bildirim
          çanı) — Next.js kuralı gereği Suspense zorunlu. */}
      <Suspense fallback={null}>
        <CrmSectionTabs
          companiesCount={contacts.length}
          influencerCount={influencers.length}
          portfolioCount={portfolioCustomers.length}
          tasksCount={tasks.length}
          companies={<GuideTable contacts={contacts} categories={categories} users={users} />}
          influencer={
            <InfluencerTable
              influencers={influencers}
              platforms={influencerPlatforms}
              contentCategories={influencerContentCategories}
            />
          }
          portfolio={
            <PortfolioTable customers={portfolioCustomers} services={services} statuses={portfolioStatuses} />
          }
          tasks={
            <TasksViewSwitcher
              columns={taskColumns}
              tasks={tasks}
              users={taskUsers}
              labels={taskLabels}
              requestTypes={taskRequestTypes}
              currentUserId={currentUser?.id ?? ""}
              isAdmin={currentUser?.role === "ADMIN"}
            />
          }
        />
      </Suspense>
    </div>
  );
}
