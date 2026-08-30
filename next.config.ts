import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Varsayılan 1MB — CV yükleme (10MB'a kadar PDF/PNG/DOCX) için artırıldı.
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
