// Influencer sekmesi — Excel (.xlsx) / CSV içe & dışa aktarma. SADECE
// tarayıcıda çalışır (bkz. components/admin/influencer/InfluencerImportExportBar.tsx,
// "use client"); exceljs'in "browser" alanı sayesinde bundler burada Node
// bağımlılığı olmayan tarayıcı derlemesini seçer.
//
// Dışa aktarma formatı "geniş" (wide) tablo: bir influencer = bir satır,
// birden fazla sosyal hesap "Platform N / Kullanıcı Adı N / Profil URL N /
// Takipçi Sayısı N" şeklinde tekrar eden sütun gruplarında tutulur. İçe
// aktarma da aynı grup desenini (numara opsiyonel, tek hesaplık şablonlarda
// "Platform" / "Kullanıcı Adı" da kabul edilir) header adından tanır — bu
// yüzden dışa aktarılan bir dosya değişiklik yapılmadan geri içe aktarılabilir.
import ExcelJS from "exceljs";
import { formatGunAyYil } from "@/lib/utils";
import type { BulkImportAccountInput, BulkImportRowInput } from "@/modules/influencer/schema";
import type { InfluencerRow } from "@/components/admin/influencer/types";

export type ParsedImportOutcome = {
  rows: BulkImportRowInput[];
  skippedEmptyCount: number;
  warnings: string[];
};

const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Dışa aktarma
// ---------------------------------------------------------------------------

function buildExportAoa(rows: InfluencerRow[]): (string | number)[][] {
  const maxAccounts = Math.max(1, ...rows.map((r) => r.accounts.length));
  const headers: string[] = ["Ad", "Soyad", "E-posta", "Telefon", "Kayıt Tarihi"];
  for (let i = 1; i <= maxAccounts; i++) {
    headers.push(`Platform ${i}`, `Kullanıcı Adı ${i}`, `Profil URL ${i}`, `Takipçi Sayısı ${i}`);
  }

  const data: (string | number)[][] = [headers];
  for (const row of rows) {
    const line: (string | number)[] = [
      row.firstName ?? "",
      row.lastName ?? "",
      row.email ?? "",
      row.phone ?? "",
      formatGunAyYil(row.recordDate),
    ];
    for (let i = 0; i < maxAccounts; i++) {
      const acc = row.accounts[i];
      line.push(acc?.platform.name ?? "", acc?.username ?? "", acc?.profileUrl ?? "", acc ? acc.followerCount : "");
    }
    data.push(line);
  }
  return data;
}

async function buildWorksheet(aoa: (string | number)[][]): Promise<ExcelJS.Workbook> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Influencerlar");
  ws.addRows(aoa);
  ws.getRow(1).font = { bold: true };
  ws.columns.forEach((col) => {
    col.width = 20;
  });
  return wb;
}

export async function exportInfluencersToXlsx(rows: InfluencerRow[], filenameBase: string): Promise<void> {
  const wb = await buildWorksheet(buildExportAoa(rows));
  const buffer = await wb.xlsx.writeBuffer();
  triggerDownload(new Blob([buffer], { type: XLSX_MIME }), `${filenameBase}.xlsx`);
}

function csvEscape(value: string | number): string {
  const str = String(value ?? "");
  return /[",\r\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function exportInfluencersToCsv(rows: InfluencerRow[], filenameBase: string): void {
  const aoa = buildExportAoa(rows);
  // Excel'in Türkçe karakterleri (ç, ş, ğ, ı, ö, ü) doğru göstermesi için
  // UTF-8 BOM eklenir — aksi halde Windows Excel'de "bozuk" karakter çıkar.
  const csvText = String.fromCharCode(0xfeff) + aoa.map((line) => line.map(csvEscape).join(",")).join("\r\n");
  triggerDownload(new Blob([csvText], { type: "text/csv;charset=utf-8;" }), `${filenameBase}.csv`);
}

export function buildExportFilenameBase(scope: "tumu" | "filtreli" | "secili"): string {
  return `influencerlar-${scope}-${todayStamp()}`;
}

/** İçe aktarma sütun düzenini gösteren örnek dolu bir Excel şablonu. */
export async function downloadInfluencerImportTemplate(): Promise<void> {
  const aoa: (string | number)[][] = [
    [
      "Ad",
      "Soyad",
      "E-posta",
      "Telefon",
      "Platform 1",
      "Kullanıcı Adı 1",
      "Profil URL 1",
      "Takipçi Sayısı 1",
      "Platform 2",
      "Kullanıcı Adı 2",
      "Profil URL 2",
      "Takipçi Sayısı 2",
    ],
    [
      "Ayşe",
      "Yılmaz",
      "ayse@ornek.com",
      "5551234567",
      "Instagram",
      "ayseyilmaz",
      "https://www.instagram.com/ayseyilmaz",
      12500,
      "TikTok",
      "ayseyilmaz",
      "",
      8300,
    ],
  ];
  const wb = await buildWorksheet(aoa);
  const buffer = await wb.xlsx.writeBuffer();
  triggerDownload(new Blob([buffer], { type: XLSX_MIME }), "influencer-ice-aktarma-sablonu.xlsx");
}

// ---------------------------------------------------------------------------
// İçe aktarma
// ---------------------------------------------------------------------------

const TURKISH_MAP: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" };

function normalizeHeader(raw: unknown): string {
  return String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/[çğıöşü]/g, (ch) => TURKISH_MAP[ch] ?? ch)
    .replace(/[^a-z0-9]+/g, "");
}

type AccountField = "platform" | "username" | "profileUrl" | "followerCount";

type ColumnMap = {
  firstName?: number;
  lastName?: number;
  email?: number;
  phone?: number;
  // Grup no (1, 2, 3…) → o gruptaki her alanın sütun index'i.
  groups: Map<number, Partial<Record<AccountField, number>>>;
};

function setGroup(map: ColumnMap, numStr: string, field: AccountField, idx: number) {
  const n = numStr ? parseInt(numStr, 10) : 1;
  const g = map.groups.get(n) ?? {};
  g[field] = idx;
  map.groups.set(n, g);
}

function mapHeaders(headerRow: unknown[]): ColumnMap {
  const map: ColumnMap = { groups: new Map() };
  headerRow.forEach((raw, idx) => {
    const norm = normalizeHeader(raw);
    if (!norm) return;

    if (norm === "ad") return void (map.firstName = idx);
    if (norm === "soyad") return void (map.lastName = idx);
    if (["eposta", "email", "mail"].includes(norm)) return void (map.email = idx);
    if (["telefon", "tel", "phone", "gsm"].includes(norm)) return void (map.phone = idx);
    if (norm === "kayittarihi") return; // bilgi amaçlı — içe aktarımda kullanılmaz (yeni kayıtta tarih otomatik basılır)

    let m = norm.match(/^platform(\d*)$/);
    if (m) return setGroup(map, m[1], "platform", idx);
    m = norm.match(/^(kullaniciadi|kullanici|username)(\d*)$/);
    if (m) return setGroup(map, m[2], "username", idx);
    m = norm.match(/^(profilurl|profil|url)(\d*)$/);
    if (m) return setGroup(map, m[2], "profileUrl", idx);
    m = norm.match(/^(takipcisayisi|takipci|followercount)(\d*)$/);
    if (m) return setGroup(map, m[2], "followerCount", idx);
  });
  return map;
}

function cellToString(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return v.toLocaleDateString("tr-TR");
  if (typeof v === "object") {
    // ExcelJS zengin hücre değerleri (hyperlink, formül sonucu vb.)
    const rich = v as { text?: unknown; result?: unknown; hyperlink?: unknown };
    if (rich.text !== undefined) return cellToString(rich.text);
    if (rich.result !== undefined) return cellToString(rich.result);
    if (rich.hyperlink !== undefined) return String(rich.hyperlink);
    return "";
  }
  return String(v).trim();
}

function cellToFollowerCount(v: unknown): number {
  const raw = cellToString(v);
  if (!raw) return 0;
  // "12.500" (binlik ayraç) ya da "12500" — her iki durumda da nokta/virgül
  // temizlenip tam sayıya yuvarlanır (takipçi sayısında ondalık beklenmez).
  const n = Number(raw.replace(/[.,](?=\d{3}(\D|$))/g, "").replace(",", "."));
  return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0;
}

function buildRowsFromAoa(aoa: unknown[][]): ParsedImportOutcome {
  if (aoa.length === 0) {
    return { rows: [], skippedEmptyCount: 0, warnings: ["Dosya boş."] };
  }

  const map = mapHeaders(aoa[0] ?? []);
  const warnings: string[] = [];
  if (map.groups.size === 0) {
    warnings.push(
      'Hiçbir sosyal medya hesabı sütunu bulunamadı ("Platform", "Kullanıcı Adı" gibi başlıklar bekleniyor) — şablonu indirip kontrol edin.'
    );
  }

  const groupEntries = [...map.groups.entries()].sort((a, b) => a[0] - b[0]);
  const rows: BulkImportRowInput[] = [];
  let skippedEmptyCount = 0;

  for (let r = 1; r < aoa.length; r++) {
    const line = aoa[r] ?? [];
    if (line.every((c) => cellToString(c) === "")) continue; // tamamen boş satır — sessizce atla

    const accounts: BulkImportAccountInput[] = [];
    for (const [, g] of groupEntries) {
      const username = g.username !== undefined ? cellToString(line[g.username]) : "";
      if (!username) continue;
      accounts.push({
        platformName: g.platform !== undefined ? cellToString(line[g.platform]) : "",
        username,
        profileUrl: g.profileUrl !== undefined ? cellToString(line[g.profileUrl]) : "",
        followerCount: g.followerCount !== undefined ? cellToFollowerCount(line[g.followerCount]) : 0,
      });
    }

    if (accounts.length === 0) {
      skippedEmptyCount += 1;
      continue;
    }

    rows.push({
      firstName: map.firstName !== undefined ? cellToString(line[map.firstName]) : "",
      lastName: map.lastName !== undefined ? cellToString(line[map.lastName]) : "",
      email: map.email !== undefined ? cellToString(line[map.email]) : "",
      phone: map.phone !== undefined ? cellToString(line[map.phone]) : "",
      accounts,
    });
  }

  return { rows, skippedEmptyCount, warnings };
}

function detectCsvDelimiter(text: string): "," | ";" {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const commas = (firstLine.match(/,/g) ?? []).length;
  const semicolons = (firstLine.match(/;/g) ?? []).length;
  return semicolons > commas ? ";" : ",";
}

/** Basit RFC4180 CSV ayrıştırıcı — tırnaklı alan, iç virgül/satırsonu destekli. */
function parseCsvText(text: string, delimiter: "," | ";"): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const cleaned = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;

  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (inQuotes) {
      if (ch === '"') {
        if (cleaned[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') inQuotes = true;
    else if (ch === delimiter) {
      row.push(field);
      field = "";
    } else if (ch === "\r") {
      // yoksay — \n satır sonunu zaten işleyecek
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** Kullanıcının seçtiği .xlsx/.xls/.csv dosyasını tarayıcıda satır dizisine çevirir. */
export async function parseInfluencerImportFile(file: File): Promise<ParsedImportOutcome> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".csv")) {
    const text = await file.text();
    const aoa = parseCsvText(text, detectCsvDelimiter(text));
    return buildRowsFromAoa(aoa);
  }

  const buffer = await file.arrayBuffer();
  const wb = new ExcelJS.Workbook();
  // Tarayıcıda Node Buffer yok — exceljs'in tarayıcı derlemesi ArrayBuffer'ı
  // da kabul ediyor, tip tanımları sadece Buffer imzasını biliyor (üstelik
  // exceljs kendi global `Buffer` arayüzünü @types/node'unkiyle çakışacak
  // şekilde merge ediyor — bu yüzden `any` ile tip kontrolü tamamen atlanır).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await wb.xlsx.load(buffer as any);
  const ws = wb.worksheets[0];
  if (!ws) return { rows: [], skippedEmptyCount: 0, warnings: ["Çalışma sayfası bulunamadı."] };

  const aoa: unknown[][] = [];
  ws.eachRow({ includeEmpty: true }, (row) => {
    const values = (row.values as unknown[]).slice(1); // ExcelJS: values[0] her zaman boş
    aoa.push(values);
  });
  return buildRowsFromAoa(aoa);
}
