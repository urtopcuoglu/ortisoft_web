import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "@node-rs/argon2";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Admin";

  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL ve ADMIN_PASSWORD .env.local içinde tanımlı olmalı."
    );
  }

  const passwordHash = await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, name, role: "ADMIN" },
    create: { email, passwordHash, name, role: "ADMIN" },
  });

  console.log(`✔ Admin kullanıcı hazır: ${user.email} (${user.role})`);

  await seedAboutContent();
  await seedTeamMembers();
  await seedServices();
}

const LOCALE = "tr";

// Bu üç backfill fonksiyonu SADECE veri hiç yoksa çalışır — admin panelinden
// yapılan canlı düzenlemeleri seed'i tekrar çalıştırınca ezmemek için.

async function seedAboutContent() {
  const existing = await prisma.aboutContent.findUnique({ where: { locale: LOCALE } });
  if (existing) return;

  await prisma.aboutContent.create({
    data: {
      locale: LOCALE,
      heroTitle: "Hakkımızda",
      heroSubtitle:
        "İşletmelerin dijital dönüşüm yolculuklarında güvenilir ortakları oluyoruz.",
      aboutText:
        "Ortisoft, 2019 yılında İstanbul'da 2 kişilik bir ekip olarak proje danışmanlığı " +
        "hizmetleriyle yola çıktı. Zamanla yazılım geliştirme ve dijital pazarlama alanlarına " +
        "genişleyerek bugün 25 kişilik uzman ekibimizle 85'in üzerinde aktif müşteriye hizmet " +
        "veriyoruz. (Bu metin otomatik oluşturulmuştur, admin panelinden düzenleyebilirsiniz.)",
      missionText:
        "Her ölçekteki işletmenin dijital potansiyelini tam anlamıyla ortaya çıkarmasına " +
        "yardımcı olmak. Teknoloji ve stratejiyi bir araya getirerek ölçülebilir, " +
        "sürdürülebilir büyüme yaratmak.",
      visionText:
        "Türkiye'nin en güvenilir dijital dönüşüm şirketi olmak ve yerel işletmeleri " +
        "küresel rekabete hazırlamak. İnovasyon ve insan merkezli teknoloji anlayışıyla " +
        "sektörde standartları belirleyen bir marka haline gelmek.",
    },
  });
  console.log("✔ AboutContent seed edildi");
}

async function seedTeamMembers() {
  const count = await prisma.teamMember.count({ where: { locale: LOCALE } });
  if (count > 0) return;

  await prisma.teamMember.createMany({
    data: [
      {
        locale: LOCALE,
        name: "Umutcan Recep TOPCUOĞLU",
        role: "Kurucu Ortak | Yazılım Geliştiricisi",
        bio: "Detaylar yakında eklenecek.",
        colorTheme: "blue",
        specialties: ["Yazılım Geliştirme", "Teknik Mimari", "Proje Danışmanlığı"],
        sortOrder: 0,
      },
      {
        locale: LOCALE,
        name: "Ezgi TOSUN",
        role: "Kurucu Ortak | Proje Yöneticisi",
        bio: "Detaylar yakında eklenecek.",
        colorTheme: "violet",
        specialties: ["Proje Yönetimi", "Müşteri İlişkileri", "Operasyon"],
        sortOrder: 1,
      },
      {
        locale: LOCALE,
        name: "Özlem Güneş AVCI",
        role: "Dijital Pazarlama ve Marka Yöneticisi",
        bio: "Detaylar yakında eklenecek.",
        colorTheme: "emerald",
        specialties: ["Dijital Pazarlama", "Marka Yönetimi", "İçerik Stratejisi"],
        sortOrder: 2,
      },
    ],
  });
  console.log("✔ TeamMember seed edildi (3 kayıt)");
}

async function seedServices() {
  const count = await prisma.service.count({ where: { locale: LOCALE } });
  if (count > 0) return;

  await prisma.service.createMany({
    data: [
      {
        locale: LOCALE, slug: "software", icon: "Code2", tag: "Tech & Dev", colorTheme: "blue", sortOrder: 0,
        title: "Yazılım Geliştirme",
        description: "Masaüstü, mobil ve web uygulamalarından kurumsal yazılım çözümlerine kadar geniş bir yelpazede özel geliştirme hizmetleri sunuyoruz.",
        features: ["Masaüstü Uygulamaları Geliştirme", "Mobil Uygulama Geliştirme", "Web Uygulamaları", "Özelleştirilmiş Finans, CRM, ERP, CMS Paket Uygulamaları", "Firma ve İşletmelere Özel Bulut Tabanlı Entegrasyon Çözümleri"],
      },
      {
        locale: LOCALE, slug: "webdesign", icon: "Monitor", tag: "Design & UX", colorTheme: "violet", sortOrder: 1,
        title: "Web Tasarım",
        description: "Tüm cihazlarda mükemmel görünen, dönüşüm odaklı modern web siteleri tasarlıyor ve geliştiriyoruz.",
        features: ["Mobil Uyumlu, E-Ticaret Web Sitesi", "Mobil Uyumlu, Kurumsal Web Sitesi", "Mobil Uyumlu, Kişisel Web Sitesi", "Mobil Uyumlu, WordPress, OpenCart, Wix ve PrestaShop Web Siteleri"],
      },
      {
        locale: LOCALE, slug: "techconsulting", icon: "Server", tag: "IT & Infrastructure", colorTheme: "cyan", sortOrder: 2,
        title: "Teknoloji Danışmanlığı",
        description: "Sunucu, ağ, donanım ve güvenlik altyapınızı optimize etmek için kapsamlı teknoloji danışmanlığı hizmetleri sunuyoruz.",
        features: ["Sunucu, Mail, Barındırma, Domain, SSL Çözümleri", "Donanım, Network, Sistem Çözümleri", "Güvenlik Çözümleri"],
      },
      {
        locale: LOCALE, slug: "digitalmarketing", icon: "BarChart3", tag: "Growth & SEO", colorTheme: "emerald", sortOrder: 3,
        title: "Dijital Pazarlama Danışmanlığı",
        description: "Arama motorlarından e-posta pazarlamasına kadar veri odaklı dijital pazarlama stratejileriyle büyümenizi hızlandırıyoruz.",
        features: ["Arama Motoru Reklamcılığı (Google Ads, Yandex Metrika vb.)", "SEO Çözümleri", "On Page – Off Page SEO Hizmetleri", "ASO (App Search Optimization) Hizmetleri", "GEO (Generative Engine Optimization) Hizmetleri", "Mail – SMS Pazarlaması Hizmetleri"],
      },
      {
        locale: LOCALE, slug: "socialmedia", icon: "Share2", tag: "Social & Influencer", colorTheme: "pink", sortOrder: 4,
        title: "Sosyal Medya Danışmanlığı",
        description: "Markanızın sosyal medyada güçlü bir varlık kurmasını sağlıyor; reklam, içerik ve influencer stratejilerini bir arada yönetiyoruz.",
        features: ["Sosyal Medya Reklamcılık (Meta, TikTok, Twitter) Hizmetleri", "Sosyal Medya Hesap Yönetimi & Hesap Analiz Hizmetleri", "Influencer Pazarlama, UGC, İçerik Pazarlama Hizmetleri"],
      },
      {
        locale: LOCALE, slug: "ecommerce", icon: "ShoppingCart", tag: "E-Commerce", colorTheme: "orange", sortOrder: 5,
        title: "E-Ticaret Danışmanlığı",
        description: "Çoklu pazaryerlerinden özel entegrasyonlara, ürün içeriklerinden yönetim çözümlerine kadar e-ticaretinizi büyütüyoruz.",
        features: ["Çoklu Pazaryeri ve Platform Kurulum Çözümleri", "Özel Entegrasyon ve Yönetim Çözümleri", "Ürün – İçerik Çözümleri (Ürün Görseli ve Ürün İçerikleri Hakkında Çalışmalar)"],
      },
      {
        locale: LOCALE, slug: "management", icon: "Briefcase", tag: "Strategy & Operations", colorTheme: "indigo", sortOrder: 6,
        title: "Yönetim Danışmanlığı",
        description: "Girişimden kurumsallaşmaya, stratejik planlamadan organizasyon tasarımına kadar işletmenizi bir adım öteye taşıyoruz.",
        features: ["Girişim ve Kuruluş Danışmanlığı", "Stratejik Planlama", "Kurumsal Yapılanma ve Organizasyon"],
      },
      {
        locale: LOCALE, slug: "project", icon: "Rocket", tag: "Grants & PM", colorTheme: "rose", sortOrder: 7,
        title: "Proje Danışmanlığı",
        description: "TÜBİTAK, KOSGEB, AB ve diğer hibe programlarından yararlanmanız için proje yönetimi, hukuk ve finans desteği sağlıyoruz.",
        features: ["TÜBİTAK, Erasmus, KOSGEB, AB, Kalkınma Ajansları vb. Kurumsal Destek & Hibe Programlarına Yönelik Çözümler", "Proje Yönetimi Çözümleri", "Proje Yönetimi Hukuk Danışmanlığı", "Proje Yönetimi Finans Danışmanlığı"],
      },
      {
        locale: LOCALE, slug: "brand", icon: "Award", tag: "Branding", colorTheme: "amber", sortOrder: 8,
        title: "Marka Danışmanlığı",
        description: "Markanızı tescil ettirmekten konumlandırmaya kadar güçlü ve sürdürülebilir bir marka kimliği oluşturmanıza destek oluyoruz.",
        features: ["Marka, Ürün, Proje ve Tasarım Patent & Tescil Çözümleri", "Marka Konumlandırma, Yönetim ve Analiz Çözümleri"],
      },
      {
        locale: LOCALE, slug: "creative", icon: "Palette", tag: "Creative & UI/UX", colorTheme: "purple", sortOrder: 9,
        title: "Kreatif Tasarım Hizmetleri",
        description: "Logo'dan kurumsal kimliğe, dijital içerikten UI/UX tasarımına kadar markanızın görsel dilini kusursuz biçimde oluşturuyoruz.",
        features: ["Afiş, Broşür, Katalog Tasarımı Hizmetleri", "Logo Tasarımı Hizmetleri", "Kartvizit, Kurumsal Kimlik Çözümleri", "Sosyal Medya, Web Sitesi ve Dijital Medya Görsel/Video İçerik Tasarım Hizmetleri", "Görsel ve Video Çekim Hizmetleri", "UI / UX Tasarım Hizmetleri"],
      },
    ],
  });
  console.log("✔ Service seed edildi (10 kayıt)");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
