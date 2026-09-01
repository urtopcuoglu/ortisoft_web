"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, ArrowUp, ArrowDown, ArrowUpDown, X } from "lucide-react";
import GuideContactModal, { type GuideContactForEdit } from "./GuideContactModal";
import DeleteForm from "./DeleteForm";
import { deleteGuideContact } from "@/modules/guide/actions";
import { GUIDE_RELATION_TYPE_LABEL, GUIDE_RELATION_TYPES } from "@/modules/guide/schema";
import { formatGunAyYil } from "@/lib/utils";
import type { GuideRelationType } from "@/lib/generated/prisma/client";

export type GuideContactRow = {
  id: string;
  companyName: string;
  authorizedPerson: string;
  categoryId: string;
  category: { id: string; name: string };
  phone: string;
  address: string | null;
  email: string;
  website: string | null;
  relatedUserId: string | null;
  relatedUser: { id: string; name: string } | null;
  relationType: GuideRelationType;
  recordDate: Date | string;
};

type SortKey = "companyName" | "authorizedPerson" | "category" | "relationType" | "relatedUser" | "recordDate";
type SortDir = "asc" | "desc";

type ColumnFilters = {
  companyName: string;
  authorizedPerson: string;
  categoryId: string;
  phone: string;
  address: string;
  email: string;
  website: string;
  relatedUserId: string;
  relationType: string;
};

const EMPTY_FILTERS: ColumnFilters = {
  companyName: "",
  authorizedPerson: "",
  categoryId: "",
  phone: "",
  address: "",
  email: "",
  website: "",
  relatedUserId: "",
  relationType: "",
};

const UNASSIGNED = "__unassigned__";

const filterInputClass =
  "w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500";
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

function toEditContact(row: GuideContactRow): GuideContactForEdit {
  return {
    id: row.id,
    companyName: row.companyName,
    authorizedPerson: row.authorizedPerson,
    categoryId: row.categoryId,
    phone: row.phone,
    address: row.address,
    email: row.email,
    website: row.website,
    relatedUserId: row.relatedUserId,
    relationType: row.relationType,
  };
}

export default function GuideTable({
  contacts,
  categories,
  users,
}: {
  contacts: GuideContactRow[];
  categories: { id: string; name: string }[];
  users: { id: string; name: string }[];
}) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<ColumnFilters>(EMPTY_FILTERS);
  const [sortKey, setSortKey] = useState<SortKey>("recordDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<GuideContactRow | null>(null);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function updateFilter<K extends keyof ColumnFilters>(key: K, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  const hasActiveFilters = search.trim() !== "" || Object.values(filters).some((v) => v !== "");

  function clearFilters() {
    setSearch("");
    setFilters(EMPTY_FILTERS);
  }

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();

    const filtered = contacts.filter((c) => {
      if (filters.companyName && !c.companyName.toLowerCase().includes(filters.companyName.toLowerCase())) return false;
      if (filters.authorizedPerson && !c.authorizedPerson.toLowerCase().includes(filters.authorizedPerson.toLowerCase())) return false;
      if (filters.phone && !c.phone.toLowerCase().includes(filters.phone.toLowerCase())) return false;
      if (filters.address && !(c.address ?? "").toLowerCase().includes(filters.address.toLowerCase())) return false;
      if (filters.email && !c.email.toLowerCase().includes(filters.email.toLowerCase())) return false;
      if (filters.website && !(c.website ?? "").toLowerCase().includes(filters.website.toLowerCase())) return false;
      if (filters.categoryId && c.categoryId !== filters.categoryId) return false;
      if (filters.relationType && c.relationType !== filters.relationType) return false;
      if (filters.relatedUserId) {
        if (filters.relatedUserId === UNASSIGNED) {
          if (c.relatedUserId) return false;
        } else if (c.relatedUserId !== filters.relatedUserId) return false;
      }

      if (q) {
        const haystack = [
          c.companyName,
          c.authorizedPerson,
          c.phone,
          c.email,
          c.address ?? "",
          c.website ?? "",
          c.category.name,
          c.relatedUser?.name ?? "",
          GUIDE_RELATION_TYPE_LABEL[c.relationType],
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
        case "companyName":
          cmp = a.companyName.localeCompare(b.companyName, "tr");
          break;
        case "authorizedPerson":
          cmp = a.authorizedPerson.localeCompare(b.authorizedPerson, "tr");
          break;
        case "category":
          cmp = a.category.name.localeCompare(b.category.name, "tr");
          break;
        case "relationType":
          cmp = GUIDE_RELATION_TYPE_LABEL[a.relationType].localeCompare(GUIDE_RELATION_TYPE_LABEL[b.relationType], "tr");
          break;
        case "relatedUser":
          cmp = (a.relatedUser?.name ?? "").localeCompare(b.relatedUser?.name ?? "", "tr");
          break;
        case "recordDate":
          cmp = new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime();
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return sorted;
  }, [contacts, search, filters, sortKey, sortDir]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rehberde ara (firma, yetkili, telefon, e-posta…)"
            className="w-72 max-w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20"
          />
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
          <Plus className="h-4 w-4" /> Yeni Ekle
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className={thClass}><SortButton sortKeyValue="companyName" currentKey={sortKey} currentDir={sortDir} onToggle={toggleSort}>Firma Adı</SortButton></th>
              <th className={thClass}><SortButton sortKeyValue="authorizedPerson" currentKey={sortKey} currentDir={sortDir} onToggle={toggleSort}>Yetkili</SortButton></th>
              <th className={thClass}><SortButton sortKeyValue="category" currentKey={sortKey} currentDir={sortDir} onToggle={toggleSort}>Kategori</SortButton></th>
              <th className={thClass}>
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Telefon</span>
              </th>
              <th className={thClass}>
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Adres</span>
              </th>
              <th className={thClass}>
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">E-posta</span>
              </th>
              <th className={thClass}>
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Web Sitesi</span>
              </th>
              <th className={thClass}><SortButton sortKeyValue="relatedUser" currentKey={sortKey} currentDir={sortDir} onToggle={toggleSort}>İlgili Kişi</SortButton></th>
              <th className={thClass}><SortButton sortKeyValue="relationType" currentKey={sortKey} currentDir={sortDir} onToggle={toggleSort}>İlişki Türü</SortButton></th>
              <th className={thClass}><SortButton sortKeyValue="recordDate" currentKey={sortKey} currentDir={sortDir} onToggle={toggleSort}>Kayıt Tarihi</SortButton></th>
              <th className={`${thClass} text-right`}>
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">İşlemler</span>
              </th>
            </tr>
            <tr className="border-t border-slate-100 dark:border-slate-800">
              <th className="px-4 pb-2">
                <input value={filters.companyName} onChange={(e) => updateFilter("companyName", e.target.value)} placeholder="Filtrele…" className={filterInputClass} />
              </th>
              <th className="px-4 pb-2">
                <input value={filters.authorizedPerson} onChange={(e) => updateFilter("authorizedPerson", e.target.value)} placeholder="Filtrele…" className={filterInputClass} />
              </th>
              <th className="px-4 pb-2">
                <select value={filters.categoryId} onChange={(e) => updateFilter("categoryId", e.target.value)} className={filterInputClass}>
                  <option value="">Tümü</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </th>
              <th className="px-4 pb-2">
                <input value={filters.phone} onChange={(e) => updateFilter("phone", e.target.value)} placeholder="Filtrele…" className={filterInputClass} />
              </th>
              <th className="px-4 pb-2">
                <input value={filters.address} onChange={(e) => updateFilter("address", e.target.value)} placeholder="Filtrele…" className={filterInputClass} />
              </th>
              <th className="px-4 pb-2">
                <input value={filters.email} onChange={(e) => updateFilter("email", e.target.value)} placeholder="Filtrele…" className={filterInputClass} />
              </th>
              <th className="px-4 pb-2">
                <input value={filters.website} onChange={(e) => updateFilter("website", e.target.value)} placeholder="Filtrele…" className={filterInputClass} />
              </th>
              <th className="px-4 pb-2">
                <select value={filters.relatedUserId} onChange={(e) => updateFilter("relatedUserId", e.target.value)} className={filterInputClass}>
                  <option value="">Tümü</option>
                  <option value={UNASSIGNED}>Atanmamış</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </th>
              <th className="px-4 pb-2">
                <select value={filters.relationType} onChange={(e) => updateFilter("relationType", e.target.value)} className={filterInputClass}>
                  <option value="">Tümü</option>
                  {GUIDE_RELATION_TYPES.map((t) => (
                    <option key={t} value={t}>{GUIDE_RELATION_TYPE_LABEL[t]}</option>
                  ))}
                </select>
              </th>
              <th className="px-4 pb-2" />
              <th className="px-4 pb-2" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={11} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                  {contacts.length === 0 ? "Henüz rehber kaydı eklenmedi." : "Filtreyle eşleşen kayıt yok."}
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">
                  <Link href={`/admin/crm/${row.id}`} className="hover:text-blue-600 hover:underline dark:hover:text-blue-400">
                    {row.companyName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{row.authorizedPerson}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {row.category.name}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{row.phone}</td>
                <td className="max-w-[160px] truncate px-4 py-3 text-slate-500 dark:text-slate-400" title={row.address ?? ""}>
                  {row.address || "—"}
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{row.email}</td>
                <td className="max-w-[140px] truncate px-4 py-3 text-slate-500 dark:text-slate-400" title={row.website ?? ""}>
                  {row.website ? (
                    <a href={row.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                      {row.website}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{row.relatedUser?.name ?? "—"}</td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{GUIDE_RELATION_TYPE_LABEL[row.relationType]}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500 dark:text-slate-400">{formatGunAyYil(row.recordDate)}</td>
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
                      action={deleteGuideContact.bind(null, row.id)}
                      confirmMessage={`"${row.companyName}" rehberden silinsin mi?`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <GuideContactModal
        key={editingRow?.id ?? "new"}
        open={modalOpen}
        onOpenChange={setModalOpen}
        categories={categories}
        users={users}
        contact={editingRow ? toEditContact(editingRow) : null}
      />
    </div>
  );
}
