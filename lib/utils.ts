import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Rehber modülü "kayıt tarihi" gösterimi — gün_ay_yıl (ör. 01_09_2026).
 * Sıralama için ayrıca gerçek DateTime (GuideContact.recordDate) tutulur,
 * bu sadece görüntüleme/biçimlendirme içindir.
 */
export function formatGunAyYil(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const gun = String(d.getDate()).padStart(2, "0");
  const ay = String(d.getMonth() + 1).padStart(2, "0");
  const yil = d.getFullYear();
  return `${gun}_${ay}_${yil}`;
}

/** CRM form'larındaki <input type="date"> defaultValue'ları için — "YYYY-MM-DD". */
export function toDateInputValue(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  const yil = d.getFullYear();
  const ay = String(d.getMonth() + 1).padStart(2, "0");
  const gun = String(d.getDate()).padStart(2, "0");
  return `${yil}-${ay}-${gun}`;
}

/**
 * Influencer modülü — sosyal medya tarzı kısaltılmış takipçi sayısı gösterimi
 * (10.000 → "10k", 12.500 → "12.5k", 1.250.000 → "1.25m"). Gereksiz ondalık
 * basılmaz (10.000 → "10k", "10.0k" değil).
 */
export function formatFollowerCount(count: number): string {
  const abs = Math.abs(count);

  function format(value: number, suffix: string): string {
    const rounded = Math.round(value * 100) / 100;
    const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
    return `${text}${suffix}`;
  }

  if (abs >= 1_000_000_000) return format(count / 1_000_000_000, "b");
  if (abs >= 1_000_000) return format(count / 1_000_000, "m");
  if (abs >= 1_000) return format(count / 1_000, "k");
  return String(count);
}

/**
 * Görev Yönetimi — TaskRequest.scheduledAt gösterimi/bildirim metni.
 * isAllDay=true ise saat atlanır (ör. "12 Eylül Cuma"), değilse saat de
 * eklenir (ör. "12 Eylül Cuma, 14:30").
 */
export function formatTaskDateTime(date: Date | string, isAllDay: boolean): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const datePart = d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" });
  if (isAllDay) return datePart;
  const timePart = d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  return `${datePart}, ${timePart}`;
}

/**
 * Influencer modülü — admin panelinden "+ yeni platform ekle" ile girilen
 * serbest metin platform adından URL-güvenli bir slug türetir (bkz.
 * modules/influencer/actions.ts#resolvePlatform). Türkçe karakterler ASCII'ye
 * çevrilir.
 */
export function slugifyPlatformName(name: string): string {
  const turkishMap: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" };
  const normalized = name.toLowerCase().replace(/[çğıöşü]/g, (ch) => turkishMap[ch] ?? ch);
  const slug = normalized.trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || "platform";
}
