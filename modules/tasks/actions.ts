"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/modules/shared/dal";
import { logAudit } from "@/modules/shared/audit";
import {
  notifyUsers,
  listMyNotifications,
  countUnreadNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/modules/shared/notifications";
import { formatTaskDateTime } from "@/lib/utils";
import {
  TaskColumnSchema,
  TaskSchema,
  TaskUpdateSchema,
  TaskSubtaskSchema,
  TaskCommentSchema,
  TaskRequestSchema,
  NEW_REQUEST_TYPE_VALUE,
  type NewTaskLabelInput,
  type TaskFormState,
} from "./schema";

const TASKS_PATH = "/admin/crm";

// ─────────────────────────────────────────────────────────
// Sıralama — "sparse float" ordering (bkz. prisma/schema.prisma dosya başı
// açıklaması). computeSparseOrder taşınan öğe HARİÇ aynı kapsamdaki
// {id, order} listesini alır, yeni pozisyonu + (nadiren gereken) bir
// rebalance haritası döner.
// ─────────────────────────────────────────────────────────
const ORDER_STEP = 1000;
const ORDER_EPSILON = 0.001;

function computeSparseOrder(
  siblings: { id: string; order: number }[],
  beforeId?: string | null,
  afterId?: string | null
): { order: number; rebalance: { id: string; order: number }[] } {
  const sorted = [...siblings].sort((a, b) => a.order - b.order);
  const prev = beforeId ? sorted.find((s) => s.id === beforeId) : undefined;
  const next = afterId ? sorted.find((s) => s.id === afterId) : undefined;
  const prevOrder = prev?.order ?? null;
  const nextOrder = next?.order ?? null;

  const needsRebalance = prevOrder != null && nextOrder != null && nextOrder - prevOrder < ORDER_EPSILON;

  if (!needsRebalance) {
    let order: number;
    if (prevOrder == null && nextOrder == null) order = ORDER_STEP;
    else if (prevOrder == null) order = nextOrder! / 2;
    else if (nextOrder == null) order = prevOrder + ORDER_STEP;
    else order = (prevOrder + nextOrder) / 2;
    return { order, rebalance: [] };
  }

  // Nadir fallback (aynı noktaya onlarca kez eklenip float hassasiyeti
  // tükenmiş) — tüm kapsamı 1000'er aralıkla yeniden numaralayıp taşınan
  // öğeyi bu taze/geniş-boşluklu sıraya göre yerleştiriyoruz.
  const rebalance = sorted.map((s, i) => ({ id: s.id, order: (i + 1) * ORDER_STEP }));
  const afterIndex = afterId ? rebalance.findIndex((s) => s.id === afterId) : -1;
  const order =
    afterIndex === -1
      ? (rebalance.at(-1)?.order ?? 0) + ORDER_STEP
      : afterIndex === 0
        ? rebalance[0].order / 2
        : (rebalance[afterIndex - 1].order + rebalance[afterIndex].order) / 2;
  return { order, rebalance };
}

const taskLink = (taskId: string) => `${TASKS_PATH}?tab=tasks&task=${taskId}`;

// ─────────────────────────────────────────────────────────
// Okuma
// ─────────────────────────────────────────────────────────

export async function listTaskColumns() {
  await verifySession();
  return prisma.taskColumn.findMany({ where: { archived: false }, orderBy: { order: "asc" } });
}

export async function listTaskLabels() {
  await verifySession();
  return prisma.taskLabel.findMany({ orderBy: { name: "asc" } });
}

/** Atanan/talep kişi seçicileri için — sistem kullanıcıları, listGuideUsers ile aynı desen. */
export async function listTaskUsers() {
  await verifySession();
  return prisma.user.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
}

export async function listTaskRequestTypes() {
  await verifySession();
  return prisma.taskRequestType.findMany({ orderBy: { name: "asc" } });
}

/** Kanban + Zaman Çizelgesi — ikisi de aynı sorgunun sonucunu paylaşır. */
export async function listTasks({ includeArchived = false }: { includeArchived?: boolean } = {}) {
  await verifySession();
  return prisma.task.findMany({
    where: includeArchived ? undefined : { archived: false },
    orderBy: { order: "asc" },
    include: {
      column: true,
      labels: true,
      assignees: { include: { user: { select: { id: true, name: true } } } },
      subtasks: {
        orderBy: { order: "asc" },
        include: { assignees: { include: { user: { select: { id: true, name: true } } } } },
      },
      _count: { select: { comments: { where: { isDeleted: false } }, requests: true } },
    },
  });
}

/** Görev detay modalı — tüm sekmelerin verisini tek seferde getirir. */
export async function getTask(id: string) {
  await verifySession();
  return prisma.task.findUnique({
    where: { id },
    include: {
      column: true,
      labels: true,
      createdBy: { select: { id: true, name: true } },
      assignees: { include: { user: { select: { id: true, name: true } } } },
      subtasks: {
        orderBy: { order: "asc" },
        include: { assignees: { include: { user: { select: { id: true, name: true } } } } },
      },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, name: true } } },
      },
      requests: {
        orderBy: { scheduledAt: "asc" },
        include: {
          type: true,
          createdBy: { select: { id: true, name: true } },
          assignees: { include: { user: { select: { id: true, name: true } } } },
        },
      },
    },
  });
}

/** Görev "Geçmiş" sekmesi — mevcut AuditLog'u entityType:"Task" ile filtreler, yeni model gerekmez. */
export async function getTaskActivity(taskId: string) {
  await verifySession();
  return prisma.auditLog.findMany({
    where: { entityType: "Task", entityId: taskId },
    orderBy: { createdAt: "desc" },
    include: { actor: { select: { name: true } } },
  });
}

// ─────────────────────────────────────────────────────────
// Sütun (v1'de tam CRUD)
// ─────────────────────────────────────────────────────────

export async function createTaskColumn(_prevState: TaskFormState, formData: FormData): Promise<TaskFormState> {
  const session = await verifySession();

  const validated = TaskColumnSchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color") ?? "",
  });
  if (!validated.success) return { errors: validated.error.flatten().fieldErrors };

  const last = await prisma.taskColumn.findFirst({
    where: { archived: false },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const column = await prisma.taskColumn.create({
    data: {
      name: validated.data.name,
      color: validated.data.color || null,
      order: (last?.order ?? 0) + ORDER_STEP,
    },
  });

  await logAudit({ actorId: session.userId, action: "CREATE", entityType: "TaskColumn", entityId: column.id });
  revalidatePath(TASKS_PATH);
  return { success: true, message: "Sütun eklendi." };
}

export async function updateTaskColumn(
  id: string,
  _prevState: TaskFormState,
  formData: FormData
): Promise<TaskFormState> {
  const session = await verifySession();

  const validated = TaskColumnSchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color") ?? "",
  });
  if (!validated.success) return { errors: validated.error.flatten().fieldErrors };

  await prisma.taskColumn.update({
    where: { id },
    data: { name: validated.data.name, color: validated.data.color || null },
  });

  await logAudit({ actorId: session.userId, action: "UPDATE", entityType: "TaskColumn", entityId: id });
  revalidatePath(TASKS_PATH);
  return { success: true, message: "Kaydedildi." };
}

/** Sütun sürükleyerek yeniden sıralama — board genelinde, moveTask ile aynı sparse-order mantığı. */
export async function reorderTaskColumn(input: { columnId: string; beforeColumnId?: string; afterColumnId?: string }) {
  const session = await verifySession();

  const siblings = await prisma.taskColumn.findMany({
    where: { archived: false, id: { not: input.columnId } },
    select: { id: true, order: true },
  });
  const { order, rebalance } = computeSparseOrder(siblings, input.beforeColumnId, input.afterColumnId);

  await prisma.$transaction([
    ...rebalance.map((r) => prisma.taskColumn.update({ where: { id: r.id }, data: { order: r.order } })),
    prisma.taskColumn.update({ where: { id: input.columnId }, data: { order } }),
  ]);

  await logAudit({ actorId: session.userId, action: "UPDATE", entityType: "TaskColumn", entityId: input.columnId, diff: { reordered: true } });
  revalidatePath(TASKS_PATH);
}

/** Sadece içinde aktif görev yoksa arşivlenebilir — doluysa dostça bir hata fırlatır. */
export async function archiveTaskColumn(id: string) {
  const session = await verifySession();

  const activeTaskCount = await prisma.task.count({ where: { columnId: id, archived: false } });
  if (activeTaskCount > 0) {
    throw new Error(
      `Bu sütun arşivlenemedi — içinde ${activeTaskCount} aktif görev var. Önce görevleri başka bir sütuna taşıyın.`
    );
  }

  await prisma.taskColumn.update({ where: { id }, data: { archived: true } });
  await logAudit({ actorId: session.userId, action: "UPDATE", entityType: "TaskColumn", entityId: id, diff: { archived: true } });
  revalidatePath(TASKS_PATH);
}

// ─────────────────────────────────────────────────────────
// Etiket (resolve-or-create, GuideCategory ile aynı desen)
// ─────────────────────────────────────────────────────────

async function resolveLabelIds(labelIds: string[], newLabels: NewTaskLabelInput[]): Promise<string[]> {
  const createdIds = await Promise.all(
    newLabels.map(async (nl) => {
      const existing = await prisma.taskLabel.findFirst({
        where: { name: { equals: nl.name, mode: "insensitive" } },
      });
      if (existing) return existing.id;
      const created = await prisma.taskLabel.create({ data: { name: nl.name, color: nl.color } });
      return created.id;
    })
  );
  return Array.from(new Set([...labelIds, ...createdIds]));
}

// ─────────────────────────────────────────────────────────
// Görev
// ─────────────────────────────────────────────────────────

export async function createTask(_prevState: TaskFormState, formData: FormData): Promise<TaskFormState> {
  const session = await verifySession();

  const validated = TaskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    priority: formData.get("priority") || "MEDIUM",
    columnId: formData.get("columnId"),
    startAt: formData.get("startAt") ?? "",
    dueAt: formData.get("dueAt") ?? "",
    labelIdsJson: formData.get("labelIdsJson") ?? "[]",
    newLabelsJson: formData.get("newLabelsJson") ?? "[]",
    assigneeUserIdsJson: formData.get("assigneeUserIdsJson") ?? "[]",
  });
  if (!validated.success) return { errors: validated.error.flatten().fieldErrors };

  const labelIds = await resolveLabelIds(validated.data.labelIdsJson, validated.data.newLabelsJson);

  const last = await prisma.task.findFirst({
    where: { columnId: validated.data.columnId, archived: false },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const task = await prisma.task.create({
    data: {
      title: validated.data.title,
      description: validated.data.description || null,
      priority: validated.data.priority,
      columnId: validated.data.columnId,
      order: (last?.order ?? 0) + ORDER_STEP,
      startAt: validated.data.startAt ?? null,
      dueAt: validated.data.dueAt ?? null,
      createdById: session.userId,
      labels: { connect: labelIds.map((id) => ({ id })) },
      assignees: {
        create: validated.data.assigneeUserIdsJson.map((userId) => ({ userId, assignedById: session.userId })),
      },
    },
  });

  await logAudit({ actorId: session.userId, action: "CREATE", entityType: "Task", entityId: task.id });

  const recipients = validated.data.assigneeUserIdsJson.filter((uid) => uid !== session.userId);
  if (recipients.length > 0) {
    await notifyUsers({
      userIds: recipients,
      type: "TASK_ASSIGNED",
      title: `"${task.title}" görevine atandınız`,
      link: taskLink(task.id),
      entityType: "Task",
      entityId: task.id,
    });
  }

  revalidatePath(TASKS_PATH);
  return { success: true, message: "Görev oluşturuldu." };
}

export async function updateTask(id: string, _prevState: TaskFormState, formData: FormData): Promise<TaskFormState> {
  const session = await verifySession();

  const validated = TaskUpdateSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    priority: formData.get("priority") || "MEDIUM",
    startAt: formData.get("startAt") ?? "",
    dueAt: formData.get("dueAt") ?? "",
    labelIdsJson: formData.get("labelIdsJson") ?? "[]",
    newLabelsJson: formData.get("newLabelsJson") ?? "[]",
  });
  if (!validated.success) return { errors: validated.error.flatten().fieldErrors };

  const existing = await prisma.task.findUnique({
    where: { id },
    include: { labels: { select: { id: true } }, assignees: { select: { userId: true } } },
  });
  if (!existing) return { success: false, message: "Görev bulunamadı." };

  const labelIds = await resolveLabelIds(validated.data.labelIdsJson, validated.data.newLabelsJson);

  const changed =
    existing.title !== validated.data.title ||
    (existing.description ?? "") !== validated.data.description ||
    existing.priority !== validated.data.priority ||
    (existing.dueAt?.getTime() ?? null) !== (validated.data.dueAt?.getTime() ?? null) ||
    (existing.startAt?.getTime() ?? null) !== (validated.data.startAt?.getTime() ?? null) ||
    JSON.stringify(existing.labels.map((l) => l.id).sort()) !== JSON.stringify([...labelIds].sort());

  await prisma.task.update({
    where: { id },
    data: {
      title: validated.data.title,
      description: validated.data.description || null,
      priority: validated.data.priority,
      startAt: validated.data.startAt ?? null,
      dueAt: validated.data.dueAt ?? null,
      labels: { set: labelIds.map((lid) => ({ id: lid })) },
    },
  });

  await logAudit({ actorId: session.userId, action: "UPDATE", entityType: "Task", entityId: id });

  if (changed) {
    const recipients = existing.assignees.map((a) => a.userId).filter((uid) => uid !== session.userId);
    if (recipients.length > 0) {
      await notifyUsers({
        userIds: recipients,
        type: "TASK_UPDATED",
        title: `"${validated.data.title}" güncellendi`,
        link: taskLink(id),
        entityType: "Task",
        entityId: id,
      });
    }
  }

  revalidatePath(TASKS_PATH);
  return { success: true, message: "Kaydedildi." };
}

/** Sürükle-bırak + "sütuna taşı" fallback'i — komşu id'lerle çağrılır, float hesabını sunucu yapar. */
export async function moveTask(input: { taskId: string; columnId: string; beforeTaskId?: string; afterTaskId?: string }) {
  const session = await verifySession();

  const task = await prisma.task.findUnique({
    where: { id: input.taskId },
    include: { assignees: { select: { userId: true } } },
  });
  if (!task) return;

  const siblings = await prisma.task.findMany({
    where: { columnId: input.columnId, archived: false, id: { not: input.taskId } },
    select: { id: true, order: true },
  });
  const { order, rebalance } = computeSparseOrder(siblings, input.beforeTaskId, input.afterTaskId);

  await prisma.$transaction([
    ...rebalance.map((r) => prisma.task.update({ where: { id: r.id }, data: { order: r.order } })),
    prisma.task.update({ where: { id: input.taskId }, data: { columnId: input.columnId, order } }),
  ]);

  const columnChanged = task.columnId !== input.columnId;
  if (columnChanged) {
    const newColumn = await prisma.taskColumn.findUnique({ where: { id: input.columnId }, select: { name: true } });
    await logAudit({
      actorId: session.userId,
      action: "UPDATE",
      entityType: "Task",
      entityId: input.taskId,
      diff: { columnId: { from: task.columnId, to: input.columnId } },
    });

    const recipients = task.assignees.map((a) => a.userId).filter((uid) => uid !== session.userId);
    if (recipients.length > 0) {
      await notifyUsers({
        userIds: recipients,
        type: "TASK_MOVED",
        title: `"${task.title}" taşındı`,
        body: newColumn ? `${newColumn.name} sütununa taşındı.` : undefined,
        link: taskLink(task.id),
        entityType: "Task",
        entityId: task.id,
      });
    }
  }

  revalidatePath(TASKS_PATH);
}

export async function archiveTask(id: string) {
  const session = await verifySession();

  const task = await prisma.task.update({
    where: { id },
    data: { archived: true, archivedAt: new Date() },
    include: { assignees: { select: { userId: true } } },
  });

  await logAudit({ actorId: session.userId, action: "UPDATE", entityType: "Task", entityId: id, diff: { archived: true } });

  const recipients = task.assignees.map((a) => a.userId).filter((uid) => uid !== session.userId);
  if (recipients.length > 0) {
    await notifyUsers({
      userIds: recipients,
      type: "TASK_UPDATED",
      title: `"${task.title}" arşivlendi`,
      link: taskLink(id),
      entityType: "Task",
      entityId: id,
    });
  }

  revalidatePath(TASKS_PATH);
}

export async function restoreTask(id: string) {
  const session = await verifySession();
  await prisma.task.update({ where: { id }, data: { archived: false, archivedAt: null } });
  await logAudit({ actorId: session.userId, action: "UPDATE", entityType: "Task", entityId: id, diff: { archived: false } });
  revalidatePath(TASKS_PATH);
}

/** Toplu/tekil görev ataması — kartın "Ata" kontrolü, updateTask'tan ayrı bilinçli bir aksiyon. */
export async function assignTask(taskId: string, userIds: string[]) {
  const session = await verifySession();

  const task = await prisma.task.findUnique({ where: { id: taskId }, include: { assignees: true } });
  if (!task) return;

  const currentIds = task.assignees.map((a) => a.userId);
  const toAdd = userIds.filter((uid) => !currentIds.includes(uid));
  const toRemove = currentIds.filter((uid) => !userIds.includes(uid));

  await prisma.$transaction([
    ...toRemove.map((uid) => prisma.taskAssignee.deleteMany({ where: { taskId, userId: uid } })),
    ...toAdd.map((uid) => prisma.taskAssignee.create({ data: { taskId, userId: uid, assignedById: session.userId } })),
  ]);

  await logAudit({
    actorId: session.userId,
    action: "UPDATE",
    entityType: "Task",
    entityId: taskId,
    diff: { assigneesAdded: toAdd, assigneesRemoved: toRemove },
  });

  const recipients = toAdd.filter((uid) => uid !== session.userId);
  if (recipients.length > 0) {
    await notifyUsers({
      userIds: recipients,
      type: "TASK_ASSIGNED",
      title: `"${task.title}" görevine atandınız`,
      link: taskLink(taskId),
      entityType: "Task",
      entityId: taskId,
    });
  }

  revalidatePath(TASKS_PATH);
}

// ─────────────────────────────────────────────────────────
// Alt görev — hafif model, bkz. prisma/schema.prisma TaskSubtask açıklaması.
// ─────────────────────────────────────────────────────────

export async function createSubtask(taskId: string, _prevState: TaskFormState, formData: FormData): Promise<TaskFormState> {
  const session = await verifySession();

  const validated = TaskSubtaskSchema.safeParse({
    title: formData.get("title"),
    dueAt: formData.get("dueAt") ?? "",
    assigneeUserIdsJson: formData.get("assigneeUserIdsJson") ?? "[]",
  });
  if (!validated.success) return { errors: validated.error.flatten().fieldErrors };

  const last = await prisma.taskSubtask.findFirst({
    where: { taskId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const subtask = await prisma.taskSubtask.create({
    data: {
      taskId,
      title: validated.data.title,
      dueAt: validated.data.dueAt ?? null,
      order: (last?.order ?? 0) + ORDER_STEP,
      assignees: {
        create: validated.data.assigneeUserIdsJson.map((userId) => ({ userId, assignedById: session.userId })),
      },
    },
  });

  await logAudit({ actorId: session.userId, action: "CREATE", entityType: "TaskSubtask", entityId: subtask.id, diff: { taskId } });

  const recipients = validated.data.assigneeUserIdsJson.filter((uid) => uid !== session.userId);
  if (recipients.length > 0) {
    await notifyUsers({
      userIds: recipients,
      type: "TASK_ASSIGNED",
      title: `"${subtask.title}" alt görevine atandınız`,
      link: taskLink(taskId),
      entityType: "Task",
      entityId: taskId,
    });
  }

  revalidatePath(TASKS_PATH);
  return { success: true, message: "Alt görev eklendi." };
}

export async function updateSubtask(id: string, _prevState: TaskFormState, formData: FormData): Promise<TaskFormState> {
  const session = await verifySession();

  const validated = TaskSubtaskSchema.omit({ assigneeUserIdsJson: true }).safeParse({
    title: formData.get("title"),
    dueAt: formData.get("dueAt") ?? "",
  });
  if (!validated.success) return { errors: validated.error.flatten().fieldErrors };

  await prisma.taskSubtask.update({
    where: { id },
    data: { title: validated.data.title, dueAt: validated.data.dueAt ?? null },
  });

  await logAudit({ actorId: session.userId, action: "UPDATE", entityType: "TaskSubtask", entityId: id });
  revalidatePath(TASKS_PATH);
  return { success: true, message: "Kaydedildi." };
}

/** Sadece "tamamlandı" işaretlendiğinde bildirir — geri alma/başlık düzenleme bildirmez (gürültü azaltma). */
export async function toggleSubtask(id: string, isDone: boolean) {
  const session = await verifySession();

  const subtask = await prisma.taskSubtask.update({
    where: { id },
    data: { isDone },
    include: { task: { include: { assignees: { select: { userId: true } } } } },
  });

  await logAudit({ actorId: session.userId, action: "UPDATE", entityType: "TaskSubtask", entityId: id, diff: { isDone } });

  if (isDone) {
    const recipients = subtask.task.assignees.map((a) => a.userId).filter((uid) => uid !== session.userId);
    if (recipients.length > 0) {
      await notifyUsers({
        userIds: recipients,
        type: "TASK_UPDATED",
        title: `"${subtask.title}" alt görevi tamamlandı`,
        link: taskLink(subtask.taskId),
        entityType: "Task",
        entityId: subtask.taskId,
      });
    }
  }

  revalidatePath(TASKS_PATH);
}

/** Hard delete — checklist item, TaskComment'in aksine tarihsel değeri yok. */
export async function deleteSubtask(id: string) {
  const session = await verifySession();
  const subtask = await prisma.taskSubtask.delete({ where: { id } });
  await logAudit({ actorId: session.userId, action: "DELETE", entityType: "TaskSubtask", entityId: id, diff: { taskId: subtask.taskId } });
  revalidatePath(TASKS_PATH);
}

export async function assignSubtask(subtaskId: string, userIds: string[]) {
  const session = await verifySession();

  const subtask = await prisma.taskSubtask.findUnique({ where: { id: subtaskId }, include: { assignees: true } });
  if (!subtask) return;

  const currentIds = subtask.assignees.map((a) => a.userId);
  const toAdd = userIds.filter((uid) => !currentIds.includes(uid));
  const toRemove = currentIds.filter((uid) => !userIds.includes(uid));

  await prisma.$transaction([
    ...toRemove.map((uid) => prisma.taskSubtaskAssignee.deleteMany({ where: { subtaskId, userId: uid } })),
    ...toAdd.map((uid) => prisma.taskSubtaskAssignee.create({ data: { subtaskId, userId: uid, assignedById: session.userId } })),
  ]);

  await logAudit({
    actorId: session.userId,
    action: "UPDATE",
    entityType: "TaskSubtask",
    entityId: subtaskId,
    diff: { assigneesAdded: toAdd, assigneesRemoved: toRemove },
  });

  const recipients = toAdd.filter((uid) => uid !== session.userId);
  if (recipients.length > 0) {
    await notifyUsers({
      userIds: recipients,
      type: "TASK_ASSIGNED",
      title: `"${subtask.title}" alt görevine atandınız`,
      link: taskLink(subtask.taskId),
      entityType: "Task",
      entityId: subtask.taskId,
    });
  }

  revalidatePath(TASKS_PATH);
}

// ─────────────────────────────────────────────────────────
// Yorum — self-relation ile sonsuz iç içe yanıt, soft delete.
// ─────────────────────────────────────────────────────────

export async function createComment(taskId: string, _prevState: TaskFormState, formData: FormData): Promise<TaskFormState> {
  const session = await verifySession();

  const validated = TaskCommentSchema.safeParse({
    body: formData.get("body"),
    parentCommentId: formData.get("parentCommentId") ?? "",
  });
  if (!validated.success) return { errors: validated.error.flatten().fieldErrors };

  const comment = await prisma.taskComment.create({
    data: {
      taskId,
      authorId: session.userId,
      body: validated.data.body,
      parentCommentId: validated.data.parentCommentId || null,
    },
  });

  await logAudit({ actorId: session.userId, action: "CREATE", entityType: "TaskComment", entityId: comment.id, diff: { taskId } });

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { title: true, assignees: { select: { userId: true } } },
  });
  const assigneeIds = (task?.assignees ?? []).map((a) => a.userId);

  // Yanıtsa önce üst yorumun yazarına özel bir bildirim gider (tekrar
  // sayılmaması için görev-atananları listesinden çıkarılır).
  let replyRecipients: string[] = [];
  if (validated.data.parentCommentId) {
    const parent = await prisma.taskComment.findUnique({
      where: { id: validated.data.parentCommentId },
      select: { authorId: true },
    });
    if (parent?.authorId && parent.authorId !== session.userId) {
      replyRecipients = [parent.authorId];
      await notifyUsers({
        userIds: replyRecipients,
        type: "TASK_COMMENT_REPLY",
        title: `"${task?.title ?? ""}" görevinde yorumunuza yanıt geldi`,
        body: validated.data.body,
        link: taskLink(taskId),
        entityType: "Task",
        entityId: taskId,
      });
    }
  }

  const commentRecipients = assigneeIds.filter((uid) => uid !== session.userId && !replyRecipients.includes(uid));
  if (commentRecipients.length > 0) {
    await notifyUsers({
      userIds: commentRecipients,
      type: "TASK_COMMENT",
      title: `"${task?.title ?? ""}" görevine yeni yorum`,
      body: validated.data.body,
      link: taskLink(taskId),
      entityType: "Task",
      entityId: taskId,
    });
  }

  revalidatePath(TASKS_PATH);
  return { success: true };
}

/** Soft delete — yazar veya ADMIN. Alt yanıt zinciri "Bu yorum silindi" placeholder'ıyla çalışmaya devam eder. */
export async function deleteComment(id: string) {
  const session = await verifySession();

  const comment = await prisma.taskComment.findUnique({ where: { id }, select: { authorId: true, taskId: true } });
  if (!comment) return;
  if (comment.authorId !== session.userId && session.role !== "ADMIN") {
    throw new Error("Bu yorumu silme yetkiniz yok.");
  }

  await prisma.taskComment.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } });
  await logAudit({ actorId: session.userId, action: "DELETE", entityType: "TaskComment", entityId: id, diff: { taskId: comment.taskId } });
  revalidatePath(TASKS_PATH);
}

// ─────────────────────────────────────────────────────────
// Talep ("şirket toplantısı oluştur" gibi ad-hoc, tarih/saat atanabilen alt-varlık)
// ─────────────────────────────────────────────────────────

async function resolveRequestTypeId(formData: FormData): Promise<{ id: string } | { error: string }> {
  const typeId = String(formData.get("typeId") ?? "");

  if (typeId === NEW_REQUEST_TYPE_VALUE) {
    const name = String(formData.get("newTypeName") ?? "").trim();
    if (name.length < 2) return { error: "Yeni tür adı en az 2 karakter olmalı." };
    const existing = await prisma.taskRequestType.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });
    if (existing) return { id: existing.id };
    const created = await prisma.taskRequestType.create({ data: { name } });
    return { id: created.id };
  }

  if (!typeId) return { error: "Talep tipi seçin." };
  return { id: typeId };
}

export async function createTaskRequest(taskId: string, _prevState: TaskFormState, formData: FormData): Promise<TaskFormState> {
  const session = await verifySession();

  const typeResult = await resolveRequestTypeId(formData);
  if ("error" in typeResult) return { errors: { typeId: [typeResult.error] } };

  const validated = TaskRequestSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    typeId: formData.get("typeId"),
    newTypeName: formData.get("newTypeName") ?? "",
    scheduledDate: formData.get("scheduledDate"),
    scheduledTime: formData.get("scheduledTime") ?? "",
    assigneesJson: formData.get("assigneesJson") ?? "[]",
  });
  if (!validated.success) return { errors: validated.error.flatten().fieldErrors };

  const isAllDay = !validated.data.scheduledTime;
  const scheduledAt = new Date(`${validated.data.scheduledDate}T${validated.data.scheduledTime || "00:00"}`);
  if (Number.isNaN(scheduledAt.getTime())) {
    return { errors: { scheduledDate: ["Geçerli bir tarih/saat girin."] } };
  }

  // "Herkese ata" oluşturma anında materialize edilir — bkz. prisma/schema.prisma
  // TaskRequestAssignee açıklaması.
  let assigneeUserIds: string[];
  if (validated.data.assigneesJson.all) {
    const allUsers = await prisma.user.findMany({ select: { id: true } });
    assigneeUserIds = allUsers.map((u) => u.id);
  } else {
    assigneeUserIds = validated.data.assigneesJson.userIds;
  }

  const request = await prisma.taskRequest.create({
    data: {
      taskId,
      typeId: typeResult.id,
      title: validated.data.title,
      description: validated.data.description || null,
      scheduledAt,
      isAllDay,
      createdById: session.userId,
      assignees: { create: assigneeUserIds.map((userId) => ({ userId })) },
    },
  });

  await logAudit({ actorId: session.userId, action: "CREATE", entityType: "TaskRequest", entityId: request.id, diff: { taskId } });

  const recipients = assigneeUserIds.filter((uid) => uid !== session.userId);
  if (recipients.length > 0) {
    await notifyUsers({
      userIds: recipients,
      type: "TASK_REQUEST_ASSIGNED",
      title: `"${validated.data.title}" talebine atandınız`,
      body: formatTaskDateTime(scheduledAt, isAllDay),
      link: taskLink(taskId),
      entityType: "TaskRequest",
      entityId: request.id,
    });
  }

  revalidatePath(TASKS_PATH);
  return { success: true, message: "Talep oluşturuldu." };
}

export async function updateTaskRequest(id: string, _prevState: TaskFormState, formData: FormData): Promise<TaskFormState> {
  const session = await verifySession();

  const typeResult = await resolveRequestTypeId(formData);
  if ("error" in typeResult) return { errors: { typeId: [typeResult.error] } };

  const validated = TaskRequestSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    typeId: formData.get("typeId"),
    newTypeName: formData.get("newTypeName") ?? "",
    scheduledDate: formData.get("scheduledDate"),
    scheduledTime: formData.get("scheduledTime") ?? "",
    assigneesJson: formData.get("assigneesJson") ?? "[]",
  });
  if (!validated.success) return { errors: validated.error.flatten().fieldErrors };

  const existing = await prisma.taskRequest.findUnique({
    where: { id },
    include: { assignees: { select: { userId: true } } },
  });
  if (!existing) return { success: false, message: "Talep bulunamadı." };

  const isAllDay = !validated.data.scheduledTime;
  const scheduledAt = new Date(`${validated.data.scheduledDate}T${validated.data.scheduledTime || "00:00"}`);
  if (Number.isNaN(scheduledAt.getTime())) {
    return { errors: { scheduledDate: ["Geçerli bir tarih/saat girin."] } };
  }

  let assigneeUserIds: string[];
  if (validated.data.assigneesJson.all) {
    const allUsers = await prisma.user.findMany({ select: { id: true } });
    assigneeUserIds = allUsers.map((u) => u.id);
  } else {
    assigneeUserIds = validated.data.assigneesJson.userIds;
  }

  const currentIds = existing.assignees.map((a) => a.userId);
  const scheduleChanged = existing.scheduledAt.getTime() !== scheduledAt.getTime() || existing.isAllDay !== isAllDay;
  const assigneesChanged = JSON.stringify([...currentIds].sort()) !== JSON.stringify([...assigneeUserIds].sort());

  await prisma.taskRequest.update({
    where: { id },
    data: {
      typeId: typeResult.id,
      title: validated.data.title,
      description: validated.data.description || null,
      scheduledAt,
      isAllDay,
      assignees: {
        deleteMany: {},
        create: assigneeUserIds.map((userId) => ({ userId })),
      },
    },
  });

  await logAudit({ actorId: session.userId, action: "UPDATE", entityType: "TaskRequest", entityId: id, diff: { taskId: existing.taskId } });

  if (scheduleChanged || assigneesChanged) {
    const recipients = assigneeUserIds.filter((uid) => uid !== session.userId);
    if (recipients.length > 0) {
      await notifyUsers({
        userIds: recipients,
        type: "TASK_REQUEST_UPDATED",
        title: `"${validated.data.title}" talebi güncellendi`,
        body: formatTaskDateTime(scheduledAt, isAllDay),
        link: taskLink(existing.taskId),
        entityType: "TaskRequest",
        entityId: id,
      });
    }
  }

  revalidatePath(TASKS_PATH);
  return { success: true, message: "Kaydedildi." };
}

/** Hard delete — bildirim yok, bilinçli olarak: iptal edilen bir talep için kimseye alarm gitmiyor. */
export async function deleteTaskRequest(id: string) {
  const session = await verifySession();
  const request = await prisma.taskRequest.delete({ where: { id } });
  await logAudit({ actorId: session.userId, action: "DELETE", entityType: "TaskRequest", entityId: id, diff: { taskId: request.taskId } });
  revalidatePath(TASKS_PATH);
}

// ─────────────────────────────────────────────────────────
// Kişisel görev bildirimleri — modules/shared/notifications.ts'in
// client-çağrılabilir sarmalayıcıları ("use server" burada, orada değil).
// ─────────────────────────────────────────────────────────

// "use server" dosyalarında export'ların bizzat bu dosyada tanımlı async
// fonksiyon olması gerekiyor — bu yüzden modules/shared/notifications.ts'i
// doğrudan re-export etmek yerine ince sarmalayıcılar tanımlıyoruz.
export async function listMyTaskNotifications(limit?: number) {
  return listMyNotifications(limit);
}

export async function countUnreadTaskNotifications() {
  return countUnreadNotifications();
}

export async function markTaskNotificationRead(id: string) {
  await markNotificationRead(id);
  revalidatePath(TASKS_PATH);
}

export async function markAllTaskNotificationsRead() {
  await markAllNotificationsRead();
  revalidatePath(TASKS_PATH);
}
