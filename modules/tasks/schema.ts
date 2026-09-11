import { z } from "zod";
import type { TaskPriority, TaskRequestStatus } from "@/lib/generated/prisma/client";

// ─────────────────────────────────────────────────────────
// Görev Yönetimi — Trello-lite Kanban + Zaman Çizelgesi (bkz. prisma/schema.prisma
// dosya başı açıklaması). Admin paneli, bu yüzden validasyon minimal tutuldu
// (GuideContact/Influencer modülleriyle aynı yaklaşım).
// ─────────────────────────────────────────────────────────

export const TASK_PRIORITY_LABEL: Record<TaskPriority, string> = {
  LOW: "Düşük",
  MEDIUM: "Orta",
  HIGH: "Yüksek",
  URGENT: "Acil",
};
export const TASK_PRIORITIES = Object.keys(TASK_PRIORITY_LABEL) as TaskPriority[];

export const TASK_REQUEST_STATUS_LABEL: Record<TaskRequestStatus, string> = {
  PLANLANDI: "Planlandı",
  TAMAMLANDI: "Tamamlandı",
  IPTAL: "İptal",
};
export const TASK_REQUEST_STATUSES = Object.keys(TASK_REQUEST_STATUS_LABEL) as TaskRequestStatus[];

// Etiket seçicideki ("+ yeni etiket ekle") sabit renk paleti — serbest renk
// girişi yerine, kartlardaki etiket çipleri görsel olarak tutarlı kalsın diye.
export const TASK_LABEL_COLOR_PALETTE = [
  "#ef4444", // kırmızı
  "#f97316", // turuncu
  "#eab308", // sarı
  "#22c55e", // yeşil
  "#06b6d4", // camgöbeği
  "#3b82f6", // mavi
  "#8b5cf6", // mor
  "#ec4899", // pembe
];

// Talep tipi dropdown'ındaki "+ yeni tür ekle" sentinel değeri — GuideCategory'deki
// NEW_CATEGORY_VALUE ile aynı desen (bkz. modules/tasks/actions.ts#resolveRequestTypeId).
export const NEW_REQUEST_TYPE_VALUE = "__new_request_type__";

// TaskRequest atanan-seçicisindeki "Herkese ata" seçeneğinin sentinel değeri —
// formdan geldiğinde oluşturma anında o anki tüm kullanıcılara MATERIALIZE
// edilir (bkz. modules/tasks/actions.ts#createTaskRequest dosya başı notu).
export const REQUEST_ASSIGN_ALL_VALUE = "__all_users__";

/**
 * Formdan tek bir gizli input'ta JSON dizi olarak gelen çoklu-değer alanları
 * için ortak transform (InfluencerSchema#accountsJson ile aynı desen) —
 * AssigneePicker/LabelPicker gibi bileşenler seçimlerini bu şekilde iletir.
 */
function jsonArraySchema<T extends z.ZodTypeAny>(
  itemSchema: T,
  options?: { min?: number; message?: string }
) {
  return z.string().transform((val, ctx) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(val || "[]");
    } catch {
      ctx.addIssue({ code: "custom", message: options?.message ?? "Veri okunamadı." });
      return z.NEVER;
    }
    let arraySchema = z.array(itemSchema);
    if (options?.min) {
      arraySchema = arraySchema.min(options.min, { error: options.message ?? "En az bir değer gerekli." });
    }
    const result = arraySchema.safeParse(parsed);
    if (!result.success) {
      ctx.addIssue({ code: "custom", message: options?.message ?? "Veri hatalı." });
      return z.NEVER;
    }
    return result.data;
  });
}

export type TaskFormState =
  | { errors?: Record<string, string[]>; message?: string; success?: boolean }
  | undefined;

// ── Sütun ──────────────────────────────────────────────────
export const TaskColumnSchema = z.object({
  name: z.string().trim().min(2, { error: "Sütun adı en az 2 karakter olmalı." }),
  color: z.string().trim().default(""),
});

// ── Etiket (yeni etiket, LabelPicker'dan inline oluşturma) ──
export const NewTaskLabelInputSchema = z.object({
  name: z.string().trim().min(1),
  color: z.string().trim().default(TASK_LABEL_COLOR_PALETTE[0]),
});
export type NewTaskLabelInput = z.infer<typeof NewTaskLabelInputSchema>;

// ── Görev ───────────────────────────────────────────────────
export const TaskSchema = z.object({
  title: z.string().trim().min(2, { error: "Başlık en az 2 karakter olmalı." }),
  description: z.string().trim().default(""),
  priority: z.enum(TASK_PRIORITIES as [TaskPriority, ...TaskPriority[]]).default("MEDIUM"),
  columnId: z.string().trim().min(1, { error: "Sütun seçin." }),
  startAt: z.preprocess((v) => (v === "" ? undefined : v), z.coerce.date().optional()),
  dueAt: z.preprocess((v) => (v === "" ? undefined : v), z.coerce.date().optional()),
  // Mevcut etiket id'leri + inline oluşturulacak yeni etiketler.
  labelIdsJson: jsonArraySchema(z.string()),
  newLabelsJson: jsonArraySchema(NewTaskLabelInputSchema),
  assigneeUserIdsJson: jsonArraySchema(z.string()),
});

// updateTask'ta sütun değişmez (bkz. moveTask) ve atananlar ayrı bir kontrol
// üzerinden değişir (bkz. assignTask) — bu yüzden ikisi de dışarıda bırakılır.
export const TaskUpdateSchema = TaskSchema.omit({ columnId: true, assigneeUserIdsJson: true });

// ── Alt görev ───────────────────────────────────────────────
export const TaskSubtaskSchema = z.object({
  title: z.string().trim().min(1, { error: "Alt görev başlığı gerekli." }),
  dueAt: z.preprocess((v) => (v === "" ? undefined : v), z.coerce.date().optional()),
  assigneeUserIdsJson: jsonArraySchema(z.string()),
});

// ── Yorum ───────────────────────────────────────────────────
export const TaskCommentSchema = z.object({
  body: z.string().trim().min(1, { error: "Yorum boş olamaz." }),
  parentCommentId: z.string().trim().default(""),
});

// ── Talep ("şirket toplantısı oluştur" gibi) ────────────────
// scheduledTime boşsa isAllDay=true olarak kaydedilir (bkz. actions.ts).
const AssigneesOrAllSchema = z.string().transform((val, ctx) => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(val || "[]");
  } catch {
    ctx.addIssue({ code: "custom", message: "Atanan kişi verisi okunamadı." });
    return z.NEVER;
  }
  if (parsed === REQUEST_ASSIGN_ALL_VALUE) {
    return { all: true as const, userIds: [] as string[] };
  }
  const result = z
    .array(z.string())
    .min(1, { error: "En az bir kişi seçin ya da 'Herkese ata' işaretleyin." })
    .safeParse(parsed);
  if (!result.success) {
    ctx.addIssue({ code: "custom", message: "En az bir kişi seçin ya da 'Herkese ata' işaretleyin." });
    return z.NEVER;
  }
  return { all: false as const, userIds: result.data };
});

export const TaskRequestSchema = z.object({
  title: z.string().trim().min(2, { error: "Başlık en az 2 karakter olmalı." }),
  description: z.string().trim().default(""),
  typeId: z.string().trim().default(""),
  newTypeName: z.string().trim().default(""),
  scheduledDate: z.string().trim().min(1, { error: "Tarih seçin." }),
  scheduledTime: z.string().trim().default(""),
  assigneesJson: AssigneesOrAllSchema,
});
