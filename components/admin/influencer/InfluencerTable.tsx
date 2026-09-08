"use client";

import { useMemo, useState } from "react";
import { Plus, ArrowUp, ArrowDown, ArrowUpDown, X, ExternalLink } from "lucide-react";
import InfluencerModal, { type InfluencerForEdit } from "./InfluencerModal";
import InfluencerQrButton from "./InfluencerQrButton";
import InfluencerDashboard from "./InfluencerDashboard";
import DeleteForm from "../DeleteForm";
import { deleteInfluencer } from "@/modules/influencer/actions";
import { formatFollowerCount, formatGunAyYil } from "@/lib/utils";
import { QR_ENABLED_PLATFORM_SLUGS } from "@/lib/social-platform";
import { resolvePlatformIcon } from "@/lib/social-platform-icons";
import { influencerDisplayName, influencerTotalFollowers, type InfluencerRow } from "./types";

type SortKey = "name" | "recordDate" | "followers";
type SortDir = "asc" | "desc";

const filterInputClass =
  "w-40 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500";
const thClass = "px-4 py-2 align-bottom";

function SortButton({
  sortKeyValue,
  currentKey,
  currentDir,
  onToggle,
  children,
}: {
  sortKeyValue: SortKey;
  currentKey: SortKey;
  currentDir: SortDir;
  onToggle: (key: SortKey) => void;
  children: React.ReactNode;
}) {
  const active = currentKey === sortKeyValue;
  const Icon = !active ? ArrowUpDown : currentDir === "asc" ? ArrowUp : ArrowDown;
  return (
    <button
      type="button"
      onClick={() => onToggle(sortKeyValue)}
      className={`flex items-center gap-1 text-xs font-bold uppercase ${
        active ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"
      }`}
    >
      {children}
      <Icon className="h-3 w-3 flex-shrink-0" />
    </button>
  );
}

function toEditInfluencer(row: InfluencerRow): InfluencerForEdit {
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    phone: row.phone,
    accounts: row.accounts.map((a) => ({
      platformId: a.platform.id,
      newPlatformName: "",
      username: a.username,
      profileUrl: a.profileUrl ?? "",
      followerCount: a.followerCount,
    })),
  };
}

export default function InfluencerTable({
  influencers,
  platforms,
}: {
  influencers: InfluencerRow[];
  platforms: { id: string; name: string }[];
}) {
  const [search, setSearch] = useState("");
  const [firstNameFilter, setFirstNameFilter] = useState("");
  const [lastNameFilter, setLastNameFilter] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("recordDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<InfluencerRow | null>(null);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const hasActiveFilters =
    search.trim() !== "" ||
    firstNameFilter !== "" ||
    lastNameFilter !== "" ||
    platformFilter !== "" ||
    dateFrom !== "" ||
    dateTo !== "";

  function clearFilters() {
    setSearch("");
    setFirstNameFilter("");
    setLastNameFilter("");
    setPlatformFilter("");
    setDateFrom("");
    setDateTo("");
  }

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    if (to) to.setHours(23, 59, 59, 999);

    const filtered = influencers.filter((inf) => {
      if (firstNameFilter && !(inf.firstName ?? "").toLowerCase().includes(firstNameFilter.toLowerCase())) return false;
      if (lastNameFilter && !(inf.lastName ?? "").toLowerCase().includes(lastNameFilter.toLowerCase())) return false;
      if (platformFilter && !inf.accounts.some((a) => a.platform.id === platformFilter)) return false;

      const recordDate = new Date(inf.recordDate);
      if (from && recordDate < from) return false;
      if (to && recordDate > to) return false;

      if (q) {
        // Aramada ada, kullanıcı adına ve soyada göre listelenebilir.
        const haystack = [
          inf.firstName ?? "",
          inf.lastName ?? "",
          inf.email ?? "",
          inf.phone ?? "",
          ...inf.accounts.map((a) => a.username),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = influencerDisplayName(a).localeCompare(influencerDisplayName(b), "tr");
          break;
        case "recordDate":
          cmp = new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime();
          break;
        case "followers":
          cmp = influencerTotalFollowers(a) - influencerTotalFollowers(b);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return sorted;
  }, [influencers, search, firstNameFilter, lastNameFilter, platformFilter, dateFrom, dateTo, sortKey, sortDir]);

  return (
    <div>
      <InfluencerDashboard influencers={influencers} />

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-500 dark:text-slate-400">Ara</label>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ad, soyad, kullanıcı adı…"
              className="w-56 max-w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-500 dark:text-slate-400">Ad</label>
            <input
              value={firstNameFilter}
              onChange={(e) => setFirstNameFilter(e.target.value)}
              placeholder="Filtrele…"
              className={filterInputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-500 dark:text-slate-400">Soyad</label>
            <input
              value={lastNameFilter}
              onChange={(e) => setLastNameFilter(e.target.value)}
              placeholder="Filtrele…"
              className={filterInputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-500 dark:text-slate-400">Platform</label>
            <select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)} className={filterInputClass}>
              <option value="">Tümü</option>
              {platforms.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Kayıt Tarihi (başlangıç)
            </label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={filterInputClass} />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Kayıt Tarihi (bitiş)
            </label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={filterInputClass} />
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
            >
              <X className="h-3.5 w-3.5" /> Filtreleri Temizle
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingRow(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Yeni Influencer Ekle
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className={thClass}>
                <SortButton sortKeyValue="name" currentKey={sortKey} currentDir={sortDir} onToggle={toggleSort}>
                  Ad Soyad
                </SortButton>
              </th>
              <th className={thClass}>
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">İletişim</span>
              </th>
              <th className={thClass}>
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Sosyal Hesaplar</span>
              </th>
              <th className={thClass}>
                <SortButton sortKeyValue="followers" currentKey={sortKey} currentDir={sortDir} onToggle={toggleSort}>
                  Toplam Takipçi
                </SortButton>
              </th>
              <th className={thClass}>
                <SortButton sortKeyValue="recordDate" currentKey={sortKey} currentDir={sortDir} onToggle={toggleSort}>
                  Kayıt Tarihi
                </SortButton>
              </th>
              <th className={`${thClass} text-right`}>
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">İşlemler</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                  {influencers.length === 0 ? "Henüz influencer kaydı eklenmedi." : "Filtreyle eşleşen kayıt yok."}
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 align-top">
                <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">
                  {influencerDisplayName(row)}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                  <div>{row.email || "—"}</div>
                  <div>{row.phone || "—"}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1.5">
                    {row.accounts.map((acc) => {
                      const Icon = resolvePlatformIcon(acc.platform.slug);
                      const canQr = QR_ENABLED_PLATFORM_SLUGS.has(acc.platform.slug);
                      return (
                        <div key={acc.id} className="flex items-center gap-1.5 text-xs">
                          <Icon className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                          <span className="font-semibold text-slate-700 dark:text-slate-200">{acc.username}</span>
                          <span className="text-slate-400 dark:text-slate-500">
                            ({formatFollowerCount(acc.followerCount)})
                          </span>
                          {acc.profileUrl && (
                            <a
                              href={acc.profileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Profili aç"
                              className="text-blue-600 hover:underline dark:text-blue-400"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          {canQr && <InfluencerQrButton accountId={acc.id} label={`${acc.platform.name} — ${acc.username}`} />}
                        </div>
                      );
                    })}
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                  {formatFollowerCount(influencerTotalFollowers(row))}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500 dark:text-slate-400">
                  {formatGunAyYil(row.recordDate)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRow(row);
                        setModalOpen(true);
                      }}
                      className="rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                      Düzenle
                    </button>
                    <DeleteForm
                      action={deleteInfluencer.bind(null, row.id)}
                      confirmMessage={`"${influencerDisplayName(row)}" influencer kaydı silinsin mi?`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InfluencerModal
        key={editingRow?.id ?? "new"}
        open={modalOpen}
        onOpenChange={setModalOpen}
        platforms={platforms}
        influencer={editingRow ? toEditInfluencer(editingRow) : null}
      />
    </div>
  );
}
