"use server";

import { prisma } from "@/lib/prisma";
import { MESSAGE_PURPOSES, MESSAGE_STATUSES } from "@/modules/messages/schema";

/**
 * Panel ana sayfası (dashboard) için tüm istatistikleri tek seferde toplar.
 * Salt-okunur — diğer modüllerdeki listMessages()/listAuditLogs() gibi ayrıca
 * verifySession() çağırmaz; gerçek güvenlik sınırı ProtectedAdminLayout'ta
 * (getCurrentUser() → verifySession()) zaten uygulanıyor.
 */
export async function getDashboardStats() {
  const [
    totalMessages,
    purposeCounts,
    statusCounts,
    totalUsers,
    totalBlogPosts,
    publishedBlogPosts,
    totalTeamMembers,
    recentBlogPosts,
    recentPages,
    recentUsers,
  ] = await Promise.all([
    prisma.contactMessage.count(),
    prisma.contactMessage.groupBy({ by: ["purpose"], _count: { _all: true } }),
    prisma.contactMessage.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.user.count(),
    prisma.blogPost.count(),
    prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
    prisma.teamMember.count(),
    prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, status: true, createdAt: true },
    }),
    prisma.sitePage.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { key: true, label: true, comingSoon: true, updatedAt: true },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, role: true, title: true, createdAt: true },
    }),
  ]);

  const purposeMap = Object.fromEntries(MESSAGE_PURPOSES.map((p) => [p, 0])) as Record<
    (typeof MESSAGE_PURPOSES)[number],
    number
  >;
  for (const row of purposeCounts) purposeMap[row.purpose] = row._count._all;

  const statusMap = Object.fromEntries(MESSAGE_STATUSES.map((s) => [s, 0])) as Record<
    (typeof MESSAGE_STATUSES)[number],
    number
  >;
  for (const row of statusCounts) statusMap[row.status] = row._count._all;

  return {
    totalMessages,
    infoRequests: purposeMap.INFO,
    serviceRequests: purposeMap.SERVICE,
    purposeCounts: purposeMap,
    statusCounts: statusMap,
    totalUsers,
    totalBlogPosts,
    publishedBlogPosts,
    totalTeamMembers,
    recentBlogPosts,
    recentPages,
    recentUsers,
  };
}
