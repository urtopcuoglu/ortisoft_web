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
