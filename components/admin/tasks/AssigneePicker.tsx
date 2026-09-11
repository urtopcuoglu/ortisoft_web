"use client";

import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown, X } from "lucide-react";
import { REQUEST_ASSIGN_ALL_VALUE } from "@/modules/tasks/schema";

export type TaskUserOption = { id: string; name: string };

const menuItemClass =
  "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 outline-none hover:bg-slate-50 dark:hover:bg-white/5";

/**
 * Görev/alt görev/talep atanan-kişi seçicisi — sistemde hazır bir çoklu-seçim
 * bileşeni yoktu (bkz. plan dokümanı), bu yüzden yeni yazıldı. Seçimini
 * gizli bir input'a JSON dizi olarak yazar (InfluencerAccountRepeater'daki
 * hidden-JSON deseniyle aynı mantık). `allowAll` açıksa (TaskRequest için)
 * "Herkese ata" seçeneği REQUEST_ASSIGN_ALL_VALUE sentinel'ini yazar (bkz.
 * modules/tasks/schema.ts#AssigneesOrAllSchema).
 */
export default function AssigneePicker({
  name,
  users,
  initialSelectedIds = [],
  allowAll = false,
  onChange,
}: {
  name: string;
  users: TaskUserOption[];
  initialSelectedIds?: string[];
  allowAll?: boolean;
  /** Seçim değiştikçe (id listesi ya da "ALL") bildirir — formsuz/doğrudan-kaydet akışları için. */
  onChange?: (ids: string[]) => void;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [all, setAll] = useState(false);

  function toggleUser(id: string) {
    setAll(false);
    setSelectedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      onChange?.(next);
      return next;
    });
  }

  const hiddenValue = all ? JSON.stringify(REQUEST_ASSIGN_ALL_VALUE) : JSON.stringify(selectedIds);
  const selectedUsers = users.filter((u) => selectedIds.includes(u.id));

  return (
    <div>
      <input type="hidden" name={name} value={hiddenValue} />
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
          >
            {all ? "Herkes" : selectedUsers.length > 0 ? `${selectedUsers.length} kişi seçildi` : "Kişi seç"}
            <ChevronDown className="h-3 w-3" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="start"
            sideOffset={4}
            className="z-50 max-h-64 min-w-[220px] overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-lg"
          >
            {allowAll && (
              <>
                <DropdownMenu.CheckboxItem
                  checked={all}
                  onCheckedChange={(checked) => setAll(checked === true)}
                  onSelect={(e) => e.preventDefault()}
                  className={menuItemClass}
                >
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded border border-slate-300 dark:border-slate-600">
                    {all && <Check className="h-3 w-3" />}
                  </span>
                  Herkese ata
                </DropdownMenu.CheckboxItem>
                <DropdownMenu.Separator className="my-1 h-px bg-slate-100 dark:bg-slate-800" />
              </>
            )}
            {users.map((u) => (
              <DropdownMenu.CheckboxItem
                key={u.id}
                checked={!all && selectedIds.includes(u.id)}
                onCheckedChange={() => toggleUser(u.id)}
                onSelect={(e) => e.preventDefault()}
                disabled={all}
                className={menuItemClass}
              >
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded border border-slate-300 dark:border-slate-600">
                  {!all && selectedIds.includes(u.id) && <Check className="h-3 w-3" />}
                </span>
                {u.name}
              </DropdownMenu.CheckboxItem>
            ))}
            {users.length === 0 && <p className="px-2 py-1.5 text-xs text-slate-400">Kullanıcı bulunamadı.</p>}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {(selectedUsers.length > 0 || all) && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {all ? (
            <span className="flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-400">
              Herkes
              <button type="button" onClick={() => setAll(false)} className="hover:text-blue-900 dark:hover:text-blue-200">
                <X className="h-3 w-3" />
              </button>
            </span>
          ) : (
            selectedUsers.map((u) => (
              <span
                key={u.id}
                className="flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {u.name}
                <button type="button" onClick={() => toggleUser(u.id)} className="hover:text-slate-900 dark:hover:text-white">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          )}
        </div>
      )}
    </div>
  );
}
