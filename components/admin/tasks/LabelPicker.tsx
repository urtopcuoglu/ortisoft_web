"use client";

import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown, Plus, X } from "lucide-react";
import { TASK_LABEL_COLOR_PALETTE } from "@/modules/tasks/schema";

export type TaskLabelOption = { id: string; name: string; color: string };
type NewLabel = { name: string; color: string };

/**
 * Etiket/kategori seçicisi — GuideCategory'deki resolve-or-create desenini
 * çoklu-seçim + inline oluşturmaya uyarlar: mevcut etiketler checkbox
 * listesinden seçilir, yenileri isim+renk girilip eklenir. İki ayrı gizli
 * input'a yazar: mevcut seçili id'ler (existingLabelsInputName) ve inline
 * oluşturulacak yeni etiketler (newLabelsInputName) — sunucu tarafında
 * resolveLabelIds() ikisini birleştirip nihai etiket id listesini üretir.
 */
export default function LabelPicker({
  existingLabelsInputName,
  newLabelsInputName,
  labels,
  initialSelectedIds = [],
}: {
  existingLabelsInputName: string;
  newLabelsInputName: string;
  labels: TaskLabelOption[];
  initialSelectedIds?: string[];
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [newLabels, setNewLabels] = useState<NewLabel[]>([]);
  const [draftName, setDraftName] = useState("");
  const [draftColor, setDraftColor] = useState(TASK_LABEL_COLOR_PALETTE[0]);

  function toggleLabel(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function addNewLabel() {
    const name = draftName.trim();
    if (!name) return;
    setNewLabels((prev) => [...prev, { name, color: draftColor }]);
    setDraftName("");
  }

  function removeNewLabel(index: number) {
    setNewLabels((prev) => prev.filter((_, i) => i !== index));
  }

  const selectedLabels = labels.filter((l) => selectedIds.includes(l.id));

  return (
    <div>
      <input type="hidden" name={existingLabelsInputName} value={JSON.stringify(selectedIds)} />
      <input type="hidden" name={newLabelsInputName} value={JSON.stringify(newLabels)} />

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
          >
            Etiket seç <ChevronDown className="h-3 w-3" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="start"
            sideOffset={4}
            className="z-50 max-h-80 min-w-[240px] overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-lg"
          >
            {labels.map((l) => (
              <DropdownMenu.CheckboxItem
                key={l.id}
                checked={selectedIds.includes(l.id)}
                onCheckedChange={() => toggleLabel(l.id)}
                onSelect={(e) => e.preventDefault()}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 outline-none hover:bg-slate-50 dark:hover:bg-white/5"
              >
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded border border-slate-300 dark:border-slate-600">
                  {selectedIds.includes(l.id) && <Check className="h-3 w-3" />}
                </span>
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                {l.name}
              </DropdownMenu.CheckboxItem>
            ))}
            {labels.length === 0 && newLabels.length === 0 && (
              <p className="px-2 py-1.5 text-xs text-slate-400">Henüz etiket yok.</p>
            )}

            <DropdownMenu.Separator className="my-1 h-px bg-slate-100 dark:bg-slate-800" />
            <div className="px-2 py-1.5">
              <div className="flex items-center gap-1.5">
                <input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addNewLabel();
                    }
                  }}
                  placeholder="+ yeni etiket"
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={addNewLabel}
                  className="shrink-0 rounded-md bg-blue-600 p-1 text-white hover:bg-blue-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {TASK_LABEL_COLOR_PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setDraftColor(c)}
                    className={`h-4 w-4 rounded-full ${draftColor === c ? "ring-2 ring-offset-1 ring-slate-400" : ""}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {(selectedLabels.length > 0 || newLabels.length > 0) && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selectedLabels.map((l) => (
            <span
              key={l.id}
              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-white"
              style={{ backgroundColor: l.color }}
            >
              {l.name}
              <button type="button" onClick={() => toggleLabel(l.id)} className="hover:opacity-75">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {newLabels.map((l, i) => (
            <span
              key={`new-${i}`}
              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-white"
              style={{ backgroundColor: l.color }}
            >
              {l.name} <span className="opacity-75">(yeni)</span>
              <button type="button" onClick={() => removeNewLabel(i)} className="hover:opacity-75">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
