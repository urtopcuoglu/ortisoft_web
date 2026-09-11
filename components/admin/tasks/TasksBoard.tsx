"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, X } from "lucide-react";
import { createTaskColumn, moveTask, reorderTaskColumn } from "@/modules/tasks/actions";
import TaskColumnView, { type TaskColumnData } from "./TaskColumnView";
import TaskCard from "./TaskCard";
import type { TaskRow } from "./types";

function AddColumnForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createTaskColumn, undefined);

  useEffect(() => {
    // "close on success" — bkz. TaskColumnView.tsx#QuickAddCard aynı desen.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (state?.success) setOpen(false);
  }, [state?.success]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-fit w-72 shrink-0 items-center gap-1.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 px-3 py-3 text-sm font-semibold text-slate-500 hover:border-slate-300 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-white/5"
      >
        <Plus className="h-4 w-4" /> Sütun Ekle
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="flex h-fit w-72 shrink-0 flex-col gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5"
    >
      <input
        name="name"
        autoFocus
        placeholder="Sütun adı…"
        className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
      />
      {state?.errors?.name && <p className="text-[10px] text-red-600">{state.errors.name[0]}</p>}
      <div className="flex items-center gap-1.5">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {pending ? "Ekleniyor…" : "Ekle"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </form>
  );
}

/**
 * Kanban panosu — dnd-kit ile hem sütun hem kart sürükleme (iç içe
 * SortableContext: dış = sütunlar yatay, TaskColumnView içindeki iç =
 * kartlar dikey, bkz. plan dokümanı "drag-and-drop kütüphanesi" kararı).
 * Sürükleme anında lokal state anında güncellenir (optimistic), sunucu
 * çağrısı (moveTask/reorderTaskColumn) arka planda gider; `tasks`/`columns`
 * prop'ları değiştikçe (revalidatePath sonrası) lokal state onlarla senkron
 * edilir — sunucu her zaman nihai referans kalır. Görev detay modalı burada
 * DEĞİL, TasksViewSwitcher'da yaşıyor — Kanban ve Zaman Çizelgesi aynı modalı
 * paylaşsın diye.
 */
export default function TasksBoard({
  columns,
  tasks,
  onOpenTask,
}: {
  columns: TaskColumnData[];
  tasks: TaskRow[];
  onOpenTask: (taskId: string) => void;
}) {
  const [localColumns, setLocalColumns] = useState(columns);
  const [localTasks, setLocalTasks] = useState(tasks);
  const [activeDrag, setActiveDrag] = useState<{ type: "column" | "task"; id: string } | null>(null);
  const [, startTransition] = useTransition();

  // `columns`/`tasks` prop'ları her revalidatePath sonrası yeni referansla
  // gelir — lokal optimistic state'i o an sunucudaki nihai haliyle senkron
  // ediyoruz (doğrudan prop'u yansıtan bir setState, kural bunu işaretlemiyor).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setLocalColumns(columns), [columns]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setLocalTasks(tasks), [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragStart(event: DragStartEvent) {
    const type = event.active.data.current?.type as "column" | "task" | undefined;
    if (type) setActiveDrag({ type, id: String(event.active.id) });
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDrag(null);
    const { active, over } = event;
    if (!over) return;

    const activeType = active.data.current?.type as "column" | "task" | undefined;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    if (activeType === "column") {
      setLocalColumns((prev) => {
        const oldIndex = prev.findIndex((c) => c.id === activeId);
        const newIndex = prev.findIndex((c) => c.id === overId);
        if (oldIndex === -1 || newIndex === -1) return prev;
        const next = arrayMove(prev, oldIndex, newIndex);
        const idx = next.findIndex((c) => c.id === activeId);
        const beforeColumnId = idx > 0 ? next[idx - 1].id : undefined;
        const afterColumnId = idx < next.length - 1 ? next[idx + 1].id : undefined;
        startTransition(() => {
          reorderTaskColumn({ columnId: activeId, beforeColumnId, afterColumnId });
        });
        return next;
      });
      return;
    }

    if (activeType === "task") {
      const overType = over.data.current?.type as "column" | "task" | undefined;
      // Hem kart-üzerine hem boş-sütun-alanına bırakma, aynı columnId'yi taşır
      // (bkz. TaskCard/TaskColumnView useSortable/useDroppable data alanları).
      const destColumnId = over.data.current?.columnId as string | undefined;
      if (!destColumnId) return;

      setLocalTasks((prev) => {
        const activeTask = prev.find((t) => t.id === activeId);
        if (!activeTask) return prev;

        const without = prev.filter((t) => t.id !== activeId);
        const destTasks = without.filter((t) => t.columnId === destColumnId);
        const otherTasks = without.filter((t) => t.columnId !== destColumnId);

        let insertIndex = destTasks.length;
        if (overType === "task") {
          const idx = destTasks.findIndex((t) => t.id === overId);
          if (idx !== -1) insertIndex = idx;
        }

        const beforeTask = insertIndex > 0 ? destTasks[insertIndex - 1] : undefined;
        const afterTask = insertIndex < destTasks.length ? destTasks[insertIndex] : undefined;

        startTransition(() => {
          moveTask({ taskId: activeId, columnId: destColumnId, beforeTaskId: beforeTask?.id, afterTaskId: afterTask?.id });
        });

        const movedTask: TaskRow = { ...activeTask, columnId: destColumnId };
        const newDestTasks = [...destTasks.slice(0, insertIndex), movedTask, ...destTasks.slice(insertIndex)];
        return [...otherTasks, ...newDestTasks];
      });
    }
  }

  const activeTaskForOverlay = activeDrag?.type === "task" ? localTasks.find((t) => t.id === activeDrag.id) : null;
  const activeColumnForOverlay = activeDrag?.type === "column" ? localColumns.find((c) => c.id === activeDrag.id) : null;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <SortableContext items={localColumns.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
        <div className="flex gap-3 overflow-x-auto pb-3">
          {localColumns.map((c) => (
            <TaskColumnView
              key={c.id}
              column={c}
              columns={localColumns}
              tasks={localTasks.filter((t) => t.columnId === c.id)}
              onOpenTask={onOpenTask}
            />
          ))}
          <AddColumnForm />
        </div>
      </SortableContext>

      <DragOverlay>
        {activeTaskForOverlay && <TaskCard task={activeTaskForOverlay} columns={localColumns} onOpen={() => {}} />}
        {activeColumnForOverlay && (
          <div className="w-72 rounded-xl border border-blue-300 bg-white/90 dark:bg-slate-900/90 p-3 text-sm font-bold text-slate-800 dark:text-slate-100 shadow-lg">
            {activeColumnForOverlay.name}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
