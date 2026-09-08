"use client";

import { useId, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { NEW_PLATFORM_VALUE } from "@/modules/influencer/schema";

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20";
const labelClass = "mb-1 block text-[11px] font-semibold text-slate-500 dark:text-slate-400";

export type InfluencerAccountRow = {
  platformId: string;
  newPlatformName: string;
  username: string;
  profileUrl: string;
  followerCount: number | "";
};

type Row = InfluencerAccountRow & { _key: string };

function emptyRow(defaultPlatformId: string): InfluencerAccountRow {
  return { platformId: defaultPlatformId, newPlatformName: "", username: "", profileUrl: "", followerCount: "" };
}

/**
 * "Tek veya birden fazla hesap" — dinamik/sonsuz sosyal medya hesabı
 * ekleyip çıkarabilen tekrarlayıcı (bkz. SubServiceRepeater ile aynı desen).
 * Her satır: platform (dinamik, "+ yeni platform ekle" ile büyür), kullanıcı
 * adı (TEK zorunlu alan), profil URL'i (opsiyonel — boşsa sunucu tarafında
 * platforma göre otomatik türetilir) ve takipçi sayısı. Sonuç, çevreleyen
 * <form>'un submit edeceği tek bir gizli input'a JSON string olarak yazılır.
 */
export default function InfluencerAccountRepeater({
  name,
  platforms,
  initial,
}: {
  name: string;
  platforms: { id: string; name: string }[];
  initial: InfluencerAccountRow[];
}) {
  const idPrefix = useId();
  const defaultPlatformId = platforms[0]?.id ?? NEW_PLATFORM_VALUE;
  const [rows, setRows] = useState<Row[]>(() =>
    (initial.length > 0 ? initial : [emptyRow(defaultPlatformId)]).map((r, i) => ({
      ...r,
      _key: `${idPrefix}-${i}`,
    }))
  );

  function updateRow(key: string, patch: Partial<InfluencerAccountRow>) {
    setRows((prev) => prev.map((r) => (r._key === key ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { ...emptyRow(defaultPlatformId), _key: `${idPrefix}-${Date.now()}` }]);
  }

  function removeRow(key: string) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r._key !== key) : prev));
  }

  const jsonValue = JSON.stringify(
    rows.map((r) => ({
      platformId: r.platformId,
      newPlatformName: r.newPlatformName,
      username: r.username,
      profileUrl: r.profileUrl,
      followerCount: r.followerCount === "" ? 0 : r.followerCount,
    }))
  );

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => (
        <div
          key={row._key}
          className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3"
        >
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <div>
              <label className={labelClass}>Platform</label>
              <select
                value={row.platformId}
                onChange={(e) => updateRow(row._key, { platformId: e.target.value })}
                className={inputClass}
              >
                {platforms.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
                <option value={NEW_PLATFORM_VALUE}>+ Yeni platform ekle</option>
              </select>
              {row.platformId === NEW_PLATFORM_VALUE && (
                <input
                  value={row.newPlatformName}
                  onChange={(e) => updateRow(row._key, { newPlatformName: e.target.value })}
                  placeholder="Yeni platform adı"
                  className={`${inputClass} mt-2`}
                  autoFocus
                />
              )}
            </div>
            <div>
              <label className={labelClass}>Kullanıcı Adı *</label>
              <input
                value={row.username}
                onChange={(e) => updateRow(row._key, { username: e.target.value })}
                placeholder="@kullaniciadi"
                className={inputClass}
                required
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => removeRow(row._key)}
                disabled={rows.length === 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:border-red-900 dark:hover:bg-red-500/10 dark:hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Hesabı sil"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Profil URL&apos;i (opsiyonel)</label>
              <input
                value={row.profileUrl}
                onChange={(e) => updateRow(row._key, { profileUrl: e.target.value })}
                placeholder="Boş bırakılırsa otomatik oluşturulur"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Takipçi Sayısı</label>
              <input
                type="number"
                min={0}
                value={row.followerCount}
                onChange={(e) =>
                  updateRow(row._key, { followerCount: e.target.value === "" ? "" : Number(e.target.value) })
                }
                placeholder="0"
                className={inputClass}
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addRow}
        className="flex w-fit items-center gap-1.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
      >
        <Plus className="h-3.5 w-3.5" /> Hesap Ekle
      </button>

      <input type="hidden" name={name} value={jsonValue} />
    </div>
  );
}
