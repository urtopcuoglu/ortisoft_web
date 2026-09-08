// Influencer modülü — sosyal medya platform URL şablonları ve varsayılan
// platform listesi (bkz. prisma/seed.ts#seedInfluencerPlatforms). Platformlar
// admin panelinden dinamik olarak büyütülebilir (bkz.
// modules/influencer/actions.ts#resolvePlatform); burada SADECE önceden
// bilinen platformlar için otomatik profil linki/QR desteği tanımlanır —
// "Diğer" ya da elle eklenen özel bir platformda kullanıcı profil URL'ini
// kendisi girmelidir.
export const DEFAULT_INFLUENCER_PLATFORMS: { name: string; slug: string }[] = [
  { name: "Instagram", slug: "instagram" },
  { name: "TikTok", slug: "tiktok" },
  { name: "YouTube", slug: "youtube" },
  { name: "X (Twitter)", slug: "x" },
  { name: "Facebook", slug: "facebook" },
  { name: "LinkedIn", slug: "linkedin" },
  { name: "Diğer", slug: "diger" },
];

function stripAt(username: string): string {
  return username.trim().replace(/^@+/, "");
}

const PROFILE_URL_BUILDERS: Record<string, (username: string) => string> = {
  instagram: (u) => `https://www.instagram.com/${stripAt(u)}`,
  tiktok: (u) => `https://www.tiktok.com/@${stripAt(u)}`,
  youtube: (u) => `https://www.youtube.com/@${stripAt(u)}`,
  facebook: (u) => `https://www.facebook.com/${stripAt(u)}`,
  x: (u) => `https://x.com/${stripAt(u)}`,
  twitter: (u) => `https://x.com/${stripAt(u)}`,
  linkedin: (u) => `https://www.linkedin.com/in/${stripAt(u)}`,
};

/**
 * Kullanıcı adından bilinen platformlar için otomatik profil linki türetir.
 * "Diğer" ya da elle eklenen özel platformlarda null döner — o durumda
 * profil linki kullanıcı tarafından elle girilmiş olmalı.
 */
export function resolveInfluencerProfileUrl(platformSlug: string, username: string): string | null {
  const builder = PROFILE_URL_BUILDERS[platformSlug];
  return builder ? builder(username) : null;
}

// QR SADECE Instagram/TikTok profilleri için isteniyor (bkz. kullanıcı
// talebi) — diğer platformlarda tabloda QR butonu gösterilmez.
export const QR_ENABLED_PLATFORM_SLUGS = new Set(["instagram", "tiktok"]);
