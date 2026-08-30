"use client";

import { useId, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { SubService } from "@/modules/services/schema";

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20";

type Row = SubService & { _key: string };

/**
 * "Dinamik/sonsuz" alt hizmet ekleyip çıkarabilen tekrarlayıcı — her satır
 * ad + açıklama (public /services'te gösterilir) ve fiyat (SADECE admin
 * panelinde görünür) içerir. Sonuç, çevreleyen <form>'un submit edeceği tek
 * bir gizli input'a JSON string olarak yazılır (name=subServicesJson).
 */
export default function SubServiceRepeater({
  name,
  initial,
}: {
  name: string;
  initial: SubService[];
}) {
  const idPrefix = useId();
  const [rows, setRows] = useState<Row[]>(() =>
    (initial.length > 0 ? initial : [{ label: "", description: "", price: null }]).map((s, i) => ({
      ...s,
      _key: `${idPrefix}-${i}`,
    }))
  );

  function updateRow(key: string, patch: Partial<SubService>) {
    setRows((prev) => prev.map((r) => (r._key === key ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { label: "", description: "", price: null, _key: `${idPrefix}-${Date.now()}` }]);
  }

  function removeRow(key: string) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r._key !== key) : prev));
  }

  const jsonValue = JSON.stringify(
    rows.map((r) => ({ label: r.label, description: r.description, price: r.price }))
  );

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, i) => (
        <div
          key={row._key}
          className="grid grid-cols-[1fr_1fr_120px_auto] gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3"
        >
          <div>
            {i === 0 && <label className="mb-1 block text-[11px] font-semibold text-slate-500 dark:text-slate-400">Alt Hizmet Adı</label>}
            <input
              value={row.label}
              onChange={(e) => updateRow(row._key, { label: e.target.value })}
              placeholder="Örn. Mobil Geliştirme"
              className={inputClass}
            />
          </div>
          <div>
            {i === 0 && <label className="mb-1 block text-[11px] font-semibold text-slate-500 dark:text-slate-400">Açıklama</label>}
            <input
              value={row.description}
              onChange={(e) => updateRow(row._key, { description: e.target.value })}
              placeholder="Kısa açıklama"
              className={inputClass}
            />
          </div>
          <div>
            {i === 0 && (
              <label className="mb-1 block text-[11px] font-semibold text-slate-500 dark:text-slate-400" title="Sadece admin panelinde görünür">
                Fiyat 🔒
              </label>
            )}
            <input
              type="number"
              step="0.01"
              value={row.price ?? ""}
              onChange={(e) => updateRow(row._key, { price: e.target.value === "" ? null : Number(e.target.value) })}
              placeholder="Opsiyonel"
              className={inputClass}
            />
          </div>
          <div className={i === 0 ? "flex items-end" : "flex items-center"}>
            <button
              type="button"
              onClick={() => removeRow(row._key)}
              disabled={rows.length === 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:border-red-900 dark:hover:bg-red-500/10 dark:hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Alt hizmeti sil"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addRow}
        className="flex w-fit items-center gap-1.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
      >
        <Plus className="h-3.5 w-3.5" /> Alt Hizmet Ekle
      </button>

      <input type="hidden" name={name} value={jsonValue} />
    </div>
  );
}
