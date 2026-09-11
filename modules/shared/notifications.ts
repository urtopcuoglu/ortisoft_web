import "server-only";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/modules/shared/dal";
import type { NotificationType } from "@/lib/generated/prisma/client";

/**
 * Görev Yönetimi (bkz. modules/tasks) için kişiye özel, sunucuda kalıcı
 * okundu/okunmadı durumu olan bildirimler. Mevcut global NotificationsBell
 * (bkz. modules/shared/audit.ts#listRecentAuditLogs) bunun için YETERSİZ —
 * o herkese aynı global aktivite akışını gösterir, okundu durumu tarayıcı
 * localStorage'ında tutulur. Buradaki bildirimler belirli bir kullanıcıya
 * hedeflidir, bu yüzden ayrı bir Notification tablosu bilinçli bir tercih.
 *
 * logAudit() gibi best-effort: hata yutulur, çağıran mutasyonu asla
 * bloklamaz — bir bildirim yazılamaması görevin oluşturulmasını/
 * güncellenmesini engellememeli.
 */
export async function notifyUsers(params: {
  userIds: string[];
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
  entityType: string;
  entityId: string;
}) {
  const uniqueUserIds = Array.from(new Set(params.userIds));
  if (uniqueUserIds.length === 0) return;

  try {
    await prisma.notification.createMany({
      data: uniqueUserIds.map((userId) => ({
        userId,
        type: params.type,
        title: params.title,
        body: params.body,
        link: params.link,
        entityType: params.entityType,
        entityId: params.entityId,
      })),
    });
  } catch (err) {
    console.error("Bildirim yazılamadı:", err);
  }
}

/** Panel üst çubuğundaki kişisel görev bildirim çanı için. */
export async function listMyNotifications(limit = 20) {
  const session = await verifySession();
  return prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function countUnreadNotifications() {
  const session = await verifySession();
  return prisma.notification.count({
    where: { userId: session.userId, isRead: false },
  });
}

export async function markNotificationRead(id: string) {
  const session = await verifySession();
  await prisma.notification.updateMany({
    where: { id, userId: session.userId },
    data: { isRead: true, readAt: new Date() },
  });
}

export async function markAllNotificationsRead() {
  const session = await verifySession();
  await prisma.notification.updateMany({
    where: { userId: session.userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
}
