"use client";

import { useRef, useState, useTransition, type ChangeEvent, type ElementType } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, Download, FileSpreadsheet, FileText, Upload, X } from "lucide-react";
import { bulkImportInfluencers } from "@/modules/influencer/actions";
import type { BulkImportResult, BulkImportRowInput } from "@/modules/influencer/schema";
import {
  buildExportFilenameBase,
  downloadInfluencerImportTemplate,
  exportInfluencersToCsv,
  exportInfluencersToXlsx,
  parseInfluencerImportFile,
} from "@/lib/influencer-import-export";
import type { InfluencerRow } from "./types";

type ExportScope = "all" | "filtered" | "selected";
type ParsedFile = { rows: BulkImportRowInput[]; warnings: string[]; skippedEmptyCount: number; fileName: string };

const menuItemClass =
  "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 outline-none hover:bg-slate-50 dark:hover:bg-white/5 data-[disabled]:pointer-events-none data-[disabled]:opacity-40";
const menuLabelClass = "px-2 py-1 text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500";

function ExportMenuItem({ onSelect, icon: Icon, label }: { onSelect: () => void; icon: ElementType; label: string }) {
  return (
    <DropdownMenu.Item onSelect={onSelect} className={menuItemClass}>
      <Icon className="h-3.5 w-3.5" /> {label}
    </DropdownMenu.Item>
  );
}

/**
 * Influencer sekmesi üst çubuğu — Excel/CSV içe aktarma ve tümü/filtreli/
 * seçili kapsamlarında dışa aktarma. Dosya ayrıştırma tamamen tarayıcıda
 * yapılır (bkz. lib/influencer-import-export.ts); sunucuya sadece zaten
 * ayrıştırılmış/doğrulanmış satırlar gönderilir (bkz.
 * modules/influencer/actions.ts#bulkImportInfluencers).
 */
export default function InfluencerImportExportBar({
  allRows,
  filteredRows,
  selectedRows,
  hasActiveFilters,
}: {
  allRows: InfluencerRow[];
  filteredRows: InfluencerRow[];
  selectedRows: InfluencerRow[];
  hasActiveFilters: boolean;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const [importOpen, setImportOpen] = useState(false);
  const [parsed, setParsed] = useState<ParsedFile | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);

  function resetImportState() {
    setParsed(null);
    setParseError(null);
    setImportResult(null);
  }

  function handleExport(scope: ExportScope, format: "xlsx" | "csv") {
    const rows = scope === "all" ? allRows : scope === "selected" ? selectedRows : filteredRows;
    if (rows.length === 0) return;
    const filenameBase = buildExportFilenameBase(scope === "all" ? "tumu" : scope === "selected" ? "secili" : "filtreli");
    if (format === "xlsx") exportInfluencersToXlsx(rows, filenameBase);
    else exportInfluencersToCsv(rows, filenameBase);
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // aynı dosya tekrar seçilebilsin diye sıfırla
    if (!file) return;

    resetImportState();
    setImportOpen(true);
    try {
      const outcome = await parseInfluencerImportFile(file);
      if (outcome.rows.length === 0) {
        setParseError(outcome.warnings[0] ?? "Dosyada içe aktarılacak geçerli satır bulunamadı.");
        return;
      }
      setParsed({ ...outcome, fileName: file.name });
    } catch (err) {
      console.error("İçe aktarma dosyası okunamadı:", err);
      setParseError("Dosya okunamadı — geçerli bir .xlsx veya .csv dosyası seçtiğinizden emin olun.");
    }
  }

  function handleConfirmImport() {
    if (!parsed) return;
    const rows = parsed.rows;
    startTransition(async () => {
      const result = await bulkImportInfluencers(rows);
      setParsed(null);
      setImportResult(result);
      if (result.createdCount > 0) router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
      >
        <Upload className="h-3.5 w-3.5" /> İçe Aktar
      </button>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
          >
            <Download className="h-3.5 w-3.5" /> İndir <ChevronDown className="h-3 w-3" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={4}
            className="z-50 min-w-[260px] rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-lg"
          >
            <DropdownMenu.Label className={menuLabelClass}>Tümünü indir ({allRows.length})</DropdownMenu.Label>
            <ExportMenuItem onSelect={() => handleExport("all", "xlsx")} icon={FileSpreadsheet} label="Excel (.xlsx)" />
            <ExportMenuItem onSelect={() => handleExport("all", "csv")} icon={FileText} label="CSV (.csv)" />

            {hasActiveFilters && (
              <>
                <DropdownMenu.Separator className="my-1 h-px bg-slate-100 dark:bg-slate-800" />
                <DropdownMenu.Label className={menuLabelClass}>
                  Filtrelenen listeyi indir ({filteredRows.length})
                </DropdownMenu.Label>
                <ExportMenuItem onSelect={() => handleExport("filtered", "xlsx")} icon={FileSpreadsheet} label="Excel (.xlsx)" />
                <ExportMenuItem onSelect={() => handleExport("filtered", "csv")} icon={FileText} label="CSV (.csv)" />
              </>
            )}

            {selectedRows.length > 0 && (
              <>
                <DropdownMenu.Separator className="my-1 h-px bg-slate-100 dark:bg-slate-800" />
                <DropdownMenu.Label className={menuLabelClass}>
                  Seçili satırları indir ({selectedRows.length})
                </DropdownMenu.Label>
                <ExportMenuItem onSelect={() => handleExport("selected", "xlsx")} icon={FileSpreadsheet} label="Excel (.xlsx)" />
                <ExportMenuItem onSelect={() => handleExport("selected", "csv")} icon={FileText} label="CSV (.csv)" />
              </>
            )}

            <DropdownMenu.Separator className="my-1 h-px bg-slate-100 dark:bg-slate-800" />
            <DropdownMenu.Item
              onSelect={() => downloadInfluencerImportTemplate()}
              className={`${menuItemClass} text-blue-600 dark:text-blue-400`}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" /> İçe aktarma şablonunu indir
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <Dialog.Root
        open={importOpen}
        onOpenChange={(open) => {
          setImportOpen(open);
          if (!open) resetImportState();
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-900/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[min(560px,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <Dialog.Title className="text-lg font-extrabold text-slate-900 dark:text-white">
                Influencer İçe Aktar
              </Dialog.Title>
              <Dialog.Close className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-slate-200">
                <X className="h-4 w-4" />
              </Dialog.Close>
            </div>

            {parseError && (
              <p className="rounded-lg bg-red-50 dark:bg-red-500/10 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400">
                {parseError}
              </p>
            )}

            {parsed && (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  <strong>{parsed.fileName}</strong> içinde <strong>{parsed.rows.length}</strong> influencer kaydı
                  bulundu.
                  {parsed.skippedEmptyCount > 0 &&
                    ` (${parsed.skippedEmptyCount} boş/hesapsız satır atlandı.)`}
                </p>
                {parsed.warnings.map((w, i) => (
                  <p key={i} className="text-xs text-amber-600 dark:text-amber-400">
                    {w}
                  </p>
                ))}
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Kayıt tarihi içe aktarma anına göre otomatik basılır. Bilinmeyen platform adları otomatik olarak
                  oluşturulur.
                </p>
                <div className="mt-2 flex justify-end gap-2">
                  <Dialog.Close className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5">
                    Vazgeç
                  </Dialog.Close>
                  <button
                    type="button"
                    onClick={handleConfirmImport}
                    disabled={isPending}
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {isPending ? "Aktarılıyor…" : `${parsed.rows.length} Kaydı İçe Aktar`}
                  </button>
                </div>
              </div>
            )}

            {importResult && (
              <div className="flex flex-col gap-3">
                <p className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 px-3.5 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
                  {importResult.createdCount} influencer kaydı başarıyla eklendi.
                </p>
                {importResult.errors.length > 0 && (
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-700 dark:text-amber-400">
                    <p className="mb-1 font-semibold">{importResult.errors.length} satır atlandı:</p>
                    <ul className="list-disc space-y-0.5 pl-4">
                      {importResult.errors.slice(0, 20).map((err, i) => (
                        <li key={i}>
                          Satır {err.row}: {err.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-2 flex justify-end">
                  <Dialog.Close className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
                    Kapat
                  </Dialog.Close>
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
