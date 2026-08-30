import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Her admin mutasyonu (create/update/delete) burada loglanır — bkz. plan
 * dokümanı Bölüm 3.3 güvenlik kontrol listesi. Loglama başarısız olsa bile
 * asıl işlemi engellememesi için hatalar yutulur (best-effort).
 */
export async function logAudit(params: {
  actorId: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  entityType: string;
  entityId: string;
  diff?: unknown;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        diff: params.diff ? JSON.parse(JSON.stringify(params.diff)) : undefined,
      },
    });
  } catch (err) {
    console.error("Audit log yazılamadı:", err);
  }
}

const LOGS_PER_PAGE = 20;

/** Admin: denetim kaydı listesi (salt-okunur, sayfalanmış). */
export async function listAuditLogs({ page = 1 }: { page?: number } = {}) {
  const [logs, totalCount] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * LOGS_PER_PAGE,
      take: LOGS_PER_PAGE,
      include: { actor: { select: { name: true, email: true } } },
    }),
    prisma.auditLog.count(),
  ]);

  return {
    logs,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / LOGS_PER_PAGE)),
    page,
  };
}

/** Panel üst çubuğundaki bildirim çanı için — sayfalama olmadan son N kayıt. */
export async function listRecentAuditLogs(limit = 10) {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { actor: { select: { name: true, email: true } } },
  });
}
