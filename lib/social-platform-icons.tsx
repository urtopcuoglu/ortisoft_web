import { Instagram, Facebook, Linkedin, Twitter, Youtube, Music2, Share2, type LucideIcon } from "lucide-react";

// lucide-react'te ayrı bir TikTok ikonu yok — Music2 en yakın görsel eşleşme
// olarak kullanılıyor. Bilinmeyen/özel platformlarda genel Share2 ikonuna düşer.
const PLATFORM_ICONS: Record<string, LucideIcon> = {
  instagram: Instagram,
  tiktok: Music2,
  youtube: Youtube,
  facebook: Facebook,
  x: Twitter,
  twitter: Twitter,
  linkedin: Linkedin,
};

export function resolvePlatformIcon(slug: string): LucideIcon {
  return PLATFORM_ICONS[slug] ?? Share2;
}
