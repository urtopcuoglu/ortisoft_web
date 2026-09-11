"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Archive, GripVertical, MoreVertical, Plus, X } from "lucide-react";
import { createTask, archiveTaskColumn, updateTaskColumn } from "@/modules/tasks/actions";
import TaskCard from "./TaskCard";
import type { TaskRow } from "./types";

export type TaskColumnData = { id: string; name: string; color: string | null };

/** Sütun altındaki "+ Kart Ekle" — Trello'nun inline hızlı ekleme kutusu. */
function QuickAddCard({ columnId }: { columnId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createTask, undefined);

  useEffect(() => {
    // Aksiyon başarıyla tamamlanınca kutuyu kapat (InfluencerModal vb.'deki
    // "close on success" deseniyle aynı mantık, burada state doğrudan bu
    // bileşenin kendi setState'i olduğu için kural bunu işaretliyor).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (state?.success) setOpen(false);
  }, [state?.success]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
      >
        <Plus className="h-3.5 w-3.5" /> Kart Ekle
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2"
    >
      <input type="hidden" name="columnId" value={columnId} />
      <textarea
        name="title"
        autoFocus
        rows={2}
        placeholder="Görev başlığı…"
        className="w-full resize-none rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
          }
        }}
      />
      {state?.errors?.title && <p className="text-[10px] text-red-600">{state.errors.title[0]}</p>}
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

/** Sütun başlığına tıklayınca inline yeniden adlandırma. */
function ColumnTitle({ column }: { column: TaskColumnData }) {
  const [renaming, setRenaming] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (renaming) {
    return (
      <form
        action={(formData) => {
          updateTaskColumn(column.id, undefined, formData);
          setRenaming(false);
        }}
        className="flex items-center gap-1"
      >
        <input
          ref={inputRef}
          name="name"
          defaultValue={column.name}
          autoFocus
          onBlur={(e) => e.currentTarget.form?.requestSubmit()}
          className="w-28 rounded border border-blue-400 bg-white dark:bg-slate-800 px-1.5 py-0.5 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none"
        />
        <input type="hidden" name="color" value={column.color ?? ""} />
      </form>
    );
  }

  return (
    <h3
      onClick={() => setRenaming(true)}
      className="cursor-pointer text-sm font-bold text-slate-800 dark:text-slate-100"
      title="Yeniden adlandırmak için tıklayın"
    >
      {column.name}
    </h3>
  );
}

export default function TaskColumnView({
  column,
  tasks,
  columns,
  onOpenTask,
}: {
  column: TaskColumnData;
  tasks: TaskRow[];
  columns: TaskColumnData[];
  onOpenTask: (taskId: string) => void;
}) {
  // Sütunun kendisi de sürüklenebilir (board genelinde yeniden sıralama) —
  // ayrı bir tutamaç (grip) ikonu üzerinden, başlık/menü ile çakışmasın diye.
  const { attributes, listeners, setNodeRef: setSortableRef, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: { type: "column" },
  });
  // Kartların bırakılabileceği alan — boş bir sütuna da bırakılabilsin diye
  // ayrıca bir droppable (kartlar üzerindeki SortableContext'ten bağımsız).
  // id, sütunun kendi sürüklenebilir id'siyle ÇAKIŞMASIN diye ayrı bir sonek
  // taşıyor (dnd-kit aynı DndContext içinde tekil id bekler); hedef sütun
  // yine de data.columnId üzerinden okunuyor.
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `${column.id}-dropzone`,
    data: { type: "column", columnId: column.id },
  });

  return (
    <div
      ref={setSortableRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex w-72 shrink-0 flex-col rounded-xl bg-slate-50 dark:bg-slate-900/40 p-2.5 ${isDragging ? "opacity-40" : ""}`}
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab rounded p-0.5 text-slate-300 hover:text-slate-500 active:cursor-grabbing dark:text-slate-600 dark:hover:text-slate-400"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: column.color ?? "#64748b" }} />
          <ColumnTitle column={column} />
          <span className="text-xs font-semibold text-slate-400">{tasks.length}</span>
        </div>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={4}
              className="z-50 min-w-[190px] rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-lg"
            >
              <DropdownMenu.Item
                onSelect={() => {
                  archiveTaskColumn(column.id).catch((err) => alert(err instanceof Error ? err.message : "Bir hata oluştu."));
                }}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 outline-none hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <Archive className="h-3.5 w-3.5" /> Sütunu Arşivle
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      <div ref={setDroppableRef} className="flex min-h-[8px] flex-col gap-2">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((t) => (
            <TaskCard key={t.id} task={t} columns={columns} onOpen={onOpenTask} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <p className="px-1 py-3 text-center text-xs text-slate-400 dark:text-slate-500">Bu sütunda görev yok.</p>
        )}
      </div>

      <div className="mt-2">
        <QuickAddCard columnId={column.id} />
      </div>
    </div>
  );
}
