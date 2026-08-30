import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Varsayılan 1MB — CV yükleme (10MB'a kadar PDF/PNG/DOCX) için artırıldı.
      bodySizeLimit: "12mb",
    },
  },
  images: {
    // Admin panelinden (ekip fotoğrafı, referans logosu, blog kapak görseli vb.)
    // herhangi bir dış https görsel URL'si girilebiliyor — tek admin hesabı
    // güvenilir kabul edildiği için host kısıtlaması yapılmıyor.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
