"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KanbanSquare, GanttChartSquare } from "lucide-react";
import TasksBoard from "./TasksBoard";
import TimelineView from "./TimelineView";
import TaskDetailModal from "./TaskDetailModal";
import type { TaskColumnData } from "./TaskColumnView";
import type { TaskRow } from "./types";
import type { TaskUserOption } from "./AssigneePicker";
import type { TaskLabelOption } from "./LabelPicker";
import type { TaskRequestTypeOption } from "./TaskRequestModal";

type View = "board" | "timeline";

/**
 * "Görev Yönetimi" sekmesinin en üst bileşeni — Pano (Kanban) ve Zaman
 * Çizelgesi görünümleri arasında geçiş yapar, ikisi de AYNI `tasks` verisini
 * paylaşır (bkz. plan dokümanı "Oluşturulan görevler bu görünümler arası
 * geçiş yapabilecek"). Görev detay modalı da burada yaşar ki hangi
 * görünümden açılırsa açılsın aynı modal kullanılsın; `?task=` query param'ı
 * bildirim çanından gelen deep-link'i otomatik açar.
 */
export default function TasksViewSwitcher({
  columns,
  tasks,
  users,
  labels,
  requestTypes,
  currentUserId,
  isAdmin,
}: {
  columns: TaskColumnData[];
  tasks: TaskRow[];
  users: TaskUserOption[];
  labels: TaskLabelOption[];
  requestTypes: TaskRequestTypeOption[];
  currentUserId: string;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<View>("board");
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);

  useEffect(() => {
    const fromUrl = searchParams.get("task");
    if (fromUrl) setOpenTaskId(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function closeTask() {
    setOpenTaskId(null);
    if (searchParams.get("task")) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("task");
      router.replace(`/admin/crm?${params.toString()}`, { scroll: false });
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-1 w-fit">
        <button
          type="button"
          onClick={() => setView("board")}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
            view === "board" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          <KanbanSquare className="h-3.5 w-3.5" /> Pano
        </button>
        <button
          type="button"
          onClick={() => setView("timeline")}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
            view === "timeline" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          <GanttChartSquare className="h-3.5 w-3.5" /> Zaman Çizelgesi
        </button>
      </div>

      {view === "board" ? (
        <TasksBoard columns={columns} tasks={tasks} onOpenTask={setOpenTaskId} />
      ) : (
        <TimelineView tasks={tasks} onOpenTask={setOpenTaskId} />
      )}

      {openTaskId && (
        <TaskDetailModal
          taskId={openTaskId}
          open={!!openTaskId}
          onOpenChange={(o) => !o && closeTask()}
          users={users}
          labels={labels}
          requestTypes={requestTypes}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
