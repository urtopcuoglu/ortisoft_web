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