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
