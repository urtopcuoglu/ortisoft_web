"use client";

import { useTransition } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CalendarClock, MessageSquare, MoreVertical, Archive, ListChecks } from "lucide-react";
import { moveTask, archiveTask } from "@/modules/tasks/actions";
import { TASK_PRIORITY_LABEL } from "@/modules/tasks/schema";
import { dueStatus, subtaskProgress, DUE_STATUS_BADGE_CLASS, TASK_PRIORITY_BADGE_CLASS, type TaskRow } from "./types";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

/**
 * Trello-tarzı kart — dnd-kit useSortable ile sürüklenebilir (bkz.
 * TasksBoard.tsx#DndContext). "⋮" menüsündeki "Sütuna Taşı" alt menüsü,
 * sürüklemenin erişilebilir fallback'i (klavye/dokunmatik) — aynı moveTask()
 * aksiyonunu çağırır. Menü tetikleyicisinde onPointerDown durduruluyor ki
 * menüyü açmak sürüklemeyi tetiklemesin.
 */
export default function TaskCard({
  task,
  columns,
  onOpen,
}: {
  task: TaskRow;
  columns: { id: string; name: string }[];
  onOpen: (taskId: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const due = dueStatus(task.dueAt);
  const { done, total } = subtaskProgress(task);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "task", columnId: task.columnId },
  });

  function handleMoveTo(columnId: string) {
    if (columnId === task.columnId) return;
    startTransition(() => {
      moveTask({ taskId: task.id, columnId });
    });
  }

  function handleArchive() {
    startTransition(() => {
      archiveTask(task.id);
    });
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(task.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen(task.id);
      }}
      className={`flex cursor-grab flex-col gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-left shadow-sm transition-opacity hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md active:cursor-grabbing ${isPending ? "opacity-60" : ""} ${isDragging ? "opacity-40" : ""}`}
    >
      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.labels.map((l) => (
            <span
              key={l.id}
              className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
              style={{ backgroundColor: l.color }}
            >
              {l.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{task.title}</p>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-slate-200"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={4}
              onClick={(e) => e.stopPropagation()}
              className="z-50 min-w-[190px] rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-lg"
            >
              <DropdownMenu.Label className="px-2 py-1 text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500">
                Sütuna Taşı
              </DropdownMenu.Label>
              {columns.map((c) => (
                <DropdownMenu.Item
                  key={c.id}
                  onSelect={() => handleMoveTo(c.id)}
                  disabled={c.id === task.columnId}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 outline-none hover:bg-slate-50 dark:hover:bg-white/5 data-[disabled]:pointer-events-none data-[disabled]:opacity-40"
                >
                  {c.name}
                </DropdownMenu.Item>
              ))}
              <DropdownMenu.Separator className="my-1 h-px bg-slate-100 dark:bg-slate-800" />
              <DropdownMenu.Item
                onSelect={handleArchive}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 outline-none hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <Archive className="h-3.5 w-3.5" /> Arşivle
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${TASK_PRIORITY_BADGE_CLASS[task.priority]}`}>
          {TASK_PRIORITY_LABEL[task.priority]}
        </span>
        {due !== "none" && (
          <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${DUE_STATUS_BADGE_CLASS[due]}`}>
            <CalendarClock className="h-3 w-3" />
            {new Date(task.dueAt!).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
          </span>
        )}
        {total > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
            <ListChecks className="h-3 w-3" />
            {done}/{total}
          </span>
        )}
        {task._count.comments > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
            <MessageSquare className="h-3 w-3" />
            {task._count.comments}
          </span>
        )}
      </div>

      {task.assignees.length > 0 && (
        <div className="flex -space-x-1.5">
          {task.assignees.slice(0, 4).map((a) => (
            <span
              key={a.id}
              title={a.user.name}
              className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white dark:border-slate-900 bg-blue-100 dark:bg-blue-500/20 text-[10px] font-bold text-blue-700 dark:text-blue-400"
            >
              {initials(a.user.name)}
            </span>
          ))}
          {task.assignees.length > 4 && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400">
              +{task.assignees.length - 4}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
