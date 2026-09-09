// InfluencerTable ve InfluencerDashboard arasında paylaşılan satır tipleri —
// ayrı bir dosyada tutuluyor ki iki bileşen birbirini type-only import etsin
// diye döngüsel import oluşmasın.
export type InfluencerAccountRowData = {
  id: string;
  username: string;
  profileUrl: string | null;
  followerCount: number;
  platform: { id: string; name: string; slug: string };
};

export type InfluencerRow = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  recordDate: Date | string;
  accounts: InfluencerAccountRowData[];
  contentCategory: { id: string; name: string } | null;
};

/** Ad+soyad varsa onu, yoksa ilk hesabın kullanıcı adını gösterir. */
export function influencerDisplayName(row: InfluencerRow): string {
  const full = [row.firstName, row.lastName].filter(Boolean).join(" ");
  return full || row.accounts[0]?.username || "İsimsiz";
}

/** Bir influencer'ın tüm hesaplarındaki takipçi toplamı. */
export function influencerTotalFollowers(row: InfluencerRow): number {
  return row.accounts.reduce((sum, a) => sum + a.followerCount, 0);
}

// Takipçi bazlı influencer sınıflandırması — DB'de saklanmaz, toplam
// takipçiden anlık türetilir (bkz. prisma/schema.prisma#Influencer). Aralıklar
// yarı-açık: bir sonraki basamağın alt sınırı bu basamağa dahil değil (ör.
// tam 10.000 takipçi Mikro sayılır, Nano değil), en üst basamağın üst sınırı
// yok.
export type InfluencerTierKey = "nano" | "mikro" | "makro" | "mega";

export const INFLUENCER_TIERS: { key: InfluencerTierKey; label: string; min: number; max: number | null }[] = [
  { key: "nano", label: "Nano Influencer", min: 1_000, max: 10_000 },
  { key: "mikro", label: "Mikro Influencer", min: 10_000, max: 100_000 },
  { key: "makro", label: "Makro Influencer", min: 100_000, max: 1_000_000 },
  { key: "mega", label: "Mega / Ünlü Influencer", min: 1_000_000, max: null },
];

/** Toplam takipçiye göre eşleşen basamağı döner; 1.000 takipçinin altı için null (kategorisiz). */
export function influencerTier(row: InfluencerRow): (typeof INFLUENCER_TIERS)[number] | null {
  const total = influencerTotalFollowers(row);
  if (total < INFLUENCER_TIERS[0].min) return null;
  return INFLUENCER_TIERS.find((t) => total >= t.min && (t.max === null || total < t.max)) ?? INFLUENCER_TIERS.at(-1)!;
}

// Seviye rozeti/kart rengi — InfluencerTable (rozet) ve InfluencerDashboard
// (istatistik kartı ikon arka planı) arasında paylaşılır ki iki yerde de
// aynı seviye aynı renkle gösterilsin.
export const INFLUENCER_TIER_BADGE_CLASS: Record<InfluencerTierKey, string> = {
  nano: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  mikro: "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
  makro: "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
  mega: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
};
