import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient, Prisma } from "../lib/generated/prisma/client";
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
  await seedReferences();
  await seedProjects();
  await seedContracts();
  await seedSitePages();
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
        subServices: [{ label: "Masaüstü Uygulamaları Geliştirme", description: "", price: null }, { label: "Mobil Uygulama Geliştirme", description: "", price: null }, { label: "Web Uygulamaları", description: "", price: null }, { label: "Özelleştirilmiş Finans, CRM, ERP, CMS Paket Uygulamaları", description: "", price: null }, { label: "Firma ve İşletmelere Özel Bulut Tabanlı Entegrasyon Çözümleri", description: "", price: null }],
      },
      {
        locale: LOCALE, slug: "webdesign", icon: "Monitor", tag: "Design & UX", colorTheme: "violet", sortOrder: 1,
        title: "Web Tasarım",
        description: "Tüm cihazlarda mükemmel görünen, dönüşüm odaklı modern web siteleri tasarlıyor ve geliştiriyoruz.",
        subServices: [{ label: "Mobil Uyumlu, E-Ticaret Web Sitesi", description: "", price: null }, { label: "Mobil Uyumlu, Kurumsal Web Sitesi", description: "", price: null }, { label: "Mobil Uyumlu, Kişisel Web Sitesi", description: "", price: null }, { label: "Mobil Uyumlu, WordPress, OpenCart, Wix ve PrestaShop Web Siteleri", description: "", price: null }],
      },
      {
        locale: LOCALE, slug: "techconsulting", icon: "Server", tag: "IT & Infrastructure", colorTheme: "cyan", sortOrder: 2,
        title: "Teknoloji Danışmanlığı",
        description: "Sunucu, ağ, donanım ve güvenlik altyapınızı optimize etmek için kapsamlı teknoloji danışmanlığı hizmetleri sunuyoruz.",
        subServices: [{ label: "Sunucu, Mail, Barındırma, Domain, SSL Çözümleri", description: "", price: null }, { label: "Donanım, Network, Sistem Çözümleri", description: "", price: null }, { label: "Güvenlik Çözümleri", description: "", price: null }],
      },
      {
        locale: LOCALE, slug: "digitalmarketing", icon: "BarChart3", tag: "Growth & SEO", colorTheme: "emerald", sortOrder: 3,
        title: "Dijital Pazarlama Danışmanlığı",
        description: "Arama motorlarından e-posta pazarlamasına kadar veri odaklı dijital pazarlama stratejileriyle büyümenizi hızlandırıyoruz.",
        subServices: [{ label: "Arama Motoru Reklamcılığı (Google Ads, Yandex Metrika vb.)", description: "", price: null }, { label: "SEO Çözümleri", description: "", price: null }, { label: "On Page – Off Page SEO Hizmetleri", description: "", price: null }, { label: "ASO (App Search Optimization) Hizmetleri", description: "", price: null }, { label: "GEO (Generative Engine Optimization) Hizmetleri", description: "", price: null }, { label: "Mail – SMS Pazarlaması Hizmetleri", description: "", price: null }],
      },
      {
        locale: LOCALE, slug: "socialmedia", icon: "Share2", tag: "Social & Influencer", colorTheme: "pink", sortOrder: 4,
        title: "Sosyal Medya Danışmanlığı",
        description: "Markanızın sosyal medyada güçlü bir varlık kurmasını sağlıyor; reklam, içerik ve influencer stratejilerini bir arada yönetiyoruz.",
        subServices: [{ label: "Sosyal Medya Reklamcılık (Meta, TikTok, Twitter) Hizmetleri", description: "", price: null }, { label: "Sosyal Medya Hesap Yönetimi & Hesap Analiz Hizmetleri", description: "", price: null }, { label: "Influencer Pazarlama, UGC, İçerik Pazarlama Hizmetleri", description: "", price: null }],
      },
      {
        locale: LOCALE, slug: "ecommerce", icon: "ShoppingCart", tag: "E-Commerce", colorTheme: "orange", sortOrder: 5,
        title: "E-Ticaret Danışmanlığı",
        description: "Çoklu pazaryerlerinden özel entegrasyonlara, ürün içeriklerinden yönetim çözümlerine kadar e-ticaretinizi büyütüyoruz.",
        subServices: [{ label: "Çoklu Pazaryeri ve Platform Kurulum Çözümleri", description: "", price: null }, { label: "Özel Entegrasyon ve Yönetim Çözümleri", description: "", price: null }, { label: "Ürün – İçerik Çözümleri (Ürün Görseli ve Ürün İçerikleri Hakkında Çalışmalar)", description: "", price: null }],
      },
      {
        locale: LOCALE, slug: "management", icon: "Briefcase", tag: "Strategy & Operations", colorTheme: "indigo", sortOrder: 6,
        title: "Yönetim Danışmanlığı",
        description: "Girişimden kurumsallaşmaya, stratejik planlamadan organizasyon tasarımına kadar işletmenizi bir adım öteye taşıyoruz.",
        subServices: [{ label: "Girişim ve Kuruluş Danışmanlığı", description: "", price: null }, { label: "Stratejik Planlama", description: "", price: null }, { label: "Kurumsal Yapılanma ve Organizasyon", description: "", price: null }],
      },
      {
        locale: LOCALE, slug: "project", icon: "Rocket", tag: "Grants & PM", colorTheme: "rose", sortOrder: 7,
        title: "Proje Danışmanlığı",
        description: "TÜBİTAK, KOSGEB, AB ve diğer hibe programlarından yararlanmanız için proje yönetimi, hukuk ve finans desteği sağlıyoruz.",
        subServices: [{ label: "TÜBİTAK, Erasmus, KOSGEB, AB, Kalkınma Ajansları vb. Kurumsal Destek & Hibe Programlarına Yönelik Çözümler", description: "", price: null }, { label: "Proje Yönetimi Çözümleri", description: "", price: null }, { label: "Proje Yönetimi Hukuk Danışmanlığı", description: "", price: null }, { label: "Proje Yönetimi Finans Danışmanlığı", description: "", price: null }],
      },
      {
        locale: LOCALE, slug: "brand", icon: "Award", tag: "Branding", colorTheme: "amber", sortOrder: 8,
        title: "Marka Danışmanlığı",
        description: "Markanızı tescil ettirmekten konumlandırmaya kadar güçlü ve sürdürülebilir bir marka kimliği oluşturmanıza destek oluyoruz.",
        subServices: [{ label: "Marka, Ürün, Proje ve Tasarım Patent & Tescil Çözümleri", description: "", price: null }, { label: "Marka Konumlandırma, Yönetim ve Analiz Çözümleri", description: "", price: null }],
      },
      {
        locale: LOCALE, slug: "creative", icon: "Palette", tag: "Creative & UI/UX", colorTheme: "purple", sortOrder: 9,
        title: "Kreatif Tasarım Hizmetleri",
        description: "Logo'dan kurumsal kimliğe, dijital içerikten UI/UX tasarımına kadar markanızın görsel dilini kusursuz biçimde oluşturuyoruz.",
        subServices: [{ label: "Afiş, Broşür, Katalog Tasarımı Hizmetleri", description: "", price: null }, { label: "Logo Tasarımı Hizmetleri", description: "", price: null }, { label: "Kartvizit, Kurumsal Kimlik Çözümleri", description: "", price: null }, { label: "Sosyal Medya, Web Sitesi ve Dijital Medya Görsel/Video İçerik Tasarım Hizmetleri", description: "", price: null }, { label: "Görsel ve Video Çekim Hizmetleri", description: "", price: null }, { label: "UI / UX Tasarım Hizmetleri", description: "", price: null }],
      },
    ],
  });
  console.log("✔ Service seed edildi (10 kayıt)");
}

async function seedReferences() {
  const count = await prisma.reference.count({ where: { locale: LOCALE } });
  if (count > 0) return;

  await prisma.reference.createMany({
    data: [
      {
        locale: LOCALE, sortOrder: 0,
        clientName: "Kasırga Bilgisayar",
        description: "Bilgisayar donanım ve yazılım çözümleri",
        logoUrl: "/referances/kasirga.png",
        projectLink: "https://www.kasirgabilgisayar.com/",
      },
      {
        locale: LOCALE, sortOrder: 1,
        clientName: "Railmentor",
        description: "Eğitim ve kariyer koçluğu platformu",
        logoUrl: "/referances/railmentor.png",
        projectLink: "https://railmentor.com.tr",
      },
      {
        locale: LOCALE, sortOrder: 2,
        clientName: "Eatwellz",
        description: "Kişisel beslenme ve sağlık danışmanlığı",
        logoUrl: "/referances/eatwellz.png",
        projectLink: "https://eatwellz.com.tr",
      },
      {
        locale: LOCALE, sortOrder: 3,
        clientName: "Gatem",
        description: "Dijital çözümler ve teknoloji hizmetleri",
        logoUrl: "/referances/gatem.png",
        projectLink: null,
      },
      {
        locale: LOCALE, sortOrder: 4,
        clientName: "Sosyolojik Müdahale",
        description: "Sosyal araştırma ve danışmanlık hizmetleri",
        logoUrl: "/referances/sosyolojikmüdahele.png",
        projectLink: "https://sosyolojikmudahale.com/",
      },
    ],
  });
  console.log("✔ Reference seed edildi (5 kayıt)");
}

async function seedProjects() {
  const count = await prisma.project.count({ where: { locale: LOCALE } });
  if (count > 0) return;

  await prisma.project.createMany({
    data: [
      {
        locale: LOCALE, sortOrder: 0,
        slug: "dukkanimbenim",
        title: "dükkanımbenim.com",
        status: "COMING_SOON",
        fundingLabel: "Ortisoft Girişimi",
        colorTheme: "slate",
        icon: "Store",
        tagline: "KOBİ'ler için hepsi bir arada dijital vitrin & CRM platformu",
        description:
          "Küçük ve orta ölçekli işletmelerin online varlıklarını kolayca yönetebilecekleri, müşteri ilişkilerini takip edebilecekleri ve satışlarını dijitale taşıyabilecekleri SaaS platformu. Kurulum gerektirmez, dakikalar içinde kullanıma hazır.",
        tags: ["SaaS", "CRM", "E-Ticaret", "KOBİ"],
        features: [
          "Dijital vitrin & ürün kataloğu",
          "Müşteri ve sipariş yönetimi",
          "WhatsApp & sosyal medya entegrasyonu",
          "Analitik dashboard",
        ],
        techStack: Prisma.JsonNull,
      },
      {
        locale: LOCALE, sortOrder: 1,
        slug: "greeneco-map",
        title: "GreenEco Map",
        status: "IN_DEVELOPMENT",
        fundingLabel: "TÜBİTAK BİGG",
        colorTheme: "emerald",
        icon: "Leaf",
        tagline: "Kahve telvesi geri dönüşüm ekosistemi — IoT + Gamification",
        description:
          "ESP32 tabanlı akıllı geri dönüşüm kutuları, mobil uygulama ve B2B/B2C gelir modeli ile kahve telvesini döngüsel ekonomiye kazandıran sürdürülebilirlik platformu. Kullanıcılar atıklarını bırakır, puan kazanır; üreticiler hammadde temin eder.",
        tags: ["IoT", "Sürdürülebilirlik", "ESP32", "Gamification", "TÜBİTAK BİGG"],
        features: [
          "Akıllı IoT kutu ağı (IP65, load cell, drainage valve)",
          "Puan & ödül gamification sistemi",
          "B2B hammadde tedarik modülü",
          "Gerçek zamanlı doluluk & analitik dashboard",
        ],
        techStack: [".NET 8", "Next.js 14", "PostgreSQL", "TimescaleDB", "Redis", "RabbitMQ", "SignalR", "Capacitor"],
      },
      {
        locale: LOCALE, sortOrder: 2,
        slug: "railmentor",
        title: "RailMentor",
        status: "IN_DEVELOPMENT",
        fundingLabel: "Erasmus+ KA210-VET",
        colorTheme: "blue",
        icon: "Train",
        tagline: "Demiryolu sektörüne adım atacak gençler için dijital mentorlük platformu",
        description:
          "Gazi MTAL koordinatörlüğünde yürütülen Erasmus+ girişimi. 14–18 yaş arası öğrencileri sektör profesyonelleriyle buluşturan akıllı eşleştirme algoritması, gerçek zamanlı iletişim ve multimedya içerik kütüphanesiyle donatılmış mentorlük platformu.",
        tags: ["Erasmus+", "EdTech", "Mentorlük", "Demiryolu", "KA210-VET"],
        features: [
          "Akıllı mentor-menti eşleştirme motoru (dezavantajlı grup önceliği)",
          "SignalR tabanlı anlık mesajlaşma & bildirim sistemi",
          "Görev atama, dijital geri bildirim & süreç takibi",
          "Podcast, video & e-öğrenme multimedya kütüphanesi",
          "Admin KPI dashboard & öğrenci ilerleme analitikleri",
          "Türkçe / İngilizce çok dil desteği (next-intl)",
        ],
        techStack: [".NET 8", "Next.js 14", "PostgreSQL", "RabbitMQ", "Redis", "SignalR", "MinIO", "Capacitor"],
      },
    ],
  });
  console.log("✔ Project seed edildi (3 kayıt)");
}

async function seedContracts() {
  const count = await prisma.contract.count();
  if (count > 0) return;

  const draftNotice =
    "<p><strong>TASLAK — Bu metin hukuki incelemeden geçmemiştir, yayına almadan önce bir hukuk danışmanına inceletilmelidir.</strong></p>";

  await prisma.contract.createMany({
    data: [
      {
        slug: "kvkk",
        title: "KVKK Aydınlatma Metni",
        sortOrder: 0,
        content:
          draftNotice +
          "<h2>1. Veri Sorumlusu</h2>" +
          "<p>6698 sayılı Kişisel Verilerin Korunması Kanunu (\"KVKK\") uyarınca, kişisel verileriniz veri sorumlusu sıfatıyla Ortisoft (\"Şirket\") tarafından aşağıda açıklanan kapsamda işlenebilecektir.</p>" +
          "<h2>2. İşlenen Kişisel Veriler ve Amaçları</h2>" +
          "<p>İletişim formu, kariyer başvuru formu ve benzeri kanallar aracılığıyla paylaştığınız ad-soyad, e-posta, telefon, şirket bilgisi, mesaj içeriği ve (varsa) özgeçmiş dosyanız; talebinizin değerlendirilmesi, tarafınızla iletişime geçilmesi, açık pozisyonlar için aday değerlendirmesi yapılması ve hizmetlerimizin sunulması amaçlarıyla işlenmektedir.</p>" +
          "<h2>3. Kişisel Verilerin Aktarılması</h2>" +
          "<p>Kişisel verileriniz, yukarıda belirtilen amaçların gerçekleştirilmesi ile sınırlı olarak hizmet aldığımız yurt içi/yurt dışı tedarikçilerle (barındırma, veritabanı ve depolama hizmet sağlayıcıları dahil) paylaşılabilir.</p>" +
          "<h2>4. Saklama Süresi</h2>" +
          "<p>Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca ve ilgili mevzuatta öngörülen zamanaşımı süreleri dikkate alınarak saklanır.</p>" +
          "<h2>5. Haklarınız</h2>" +
          "<p>KVKK'nın 11. maddesi uyarınca kişisel verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini/silinmesini isteme gibi haklara sahipsiniz. Taleplerinizi <a href=\"mailto:ortisofttech@gmail.com\">ortisofttech@gmail.com</a> adresine iletebilirsiniz.</p>",
      },
      {
        slug: "gizlilik-politikasi",
        title: "Gizlilik Politikası",
        sortOrder: 1,
        content:
          draftNotice +
          "<h2>1. Genel</h2>" +
          "<p>Bu Gizlilik Politikası, ortisoft.com.tr (\"Site\") üzerinden toplanan bilgilerin nasıl kullanıldığını açıklar.</p>" +
          "<h2>2. Toplanan Bilgiler</h2>" +
          "<p>İletişim ve kariyer formları aracılığıyla gönderdiğiniz ad, e-posta, telefon ve mesaj içerikleri; site kullanım istatistikleri için Google Analytics çerezleri.</p>" +
          "<h2>3. Bilgilerin Kullanımı</h2>" +
          "<p>Toplanan bilgiler yalnızca talebinizi yanıtlamak, hizmet kalitemizi artırmak ve yasal yükümlülükleri yerine getirmek amacıyla kullanılır; üçüncü taraflarla pazarlama amacıyla paylaşılmaz.</p>" +
          "<h2>4. İletişim</h2>" +
          "<p>Sorularınız için <a href=\"mailto:ortisofttech@gmail.com\">ortisofttech@gmail.com</a> adresinden bize ulaşabilirsiniz.</p>",
      },
      {
        slug: "cerez-politikasi",
        title: "Çerez Politikası",
        sortOrder: 2,
        content:
          draftNotice +
          "<h2>1. Çerez Nedir?</h2>" +
          "<p>Çerezler, ziyaret ettiğiniz web siteleri tarafından tarayıcınıza kaydedilen küçük metin dosyalarıdır.</p>" +
          "<h2>2. Kullandığımız Çerez Türleri</h2>" +
          "<ul><li>Zorunlu çerezler — sitenin temel işlevleri için gereklidir.</li><li>Analitik çerezler (Google Analytics) — site kullanımını anlamamıza yardımcı olur.</li></ul>" +
          "<h2>3. Çerezleri Yönetme</h2>" +
          "<p>Tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz; ancak bu, bazı site özelliklerinin düzgün çalışmamasına neden olabilir.</p>",
      },
    ],
  });
  console.log("✔ Contract seed edildi (3 kayıt: kvkk, gizlilik, çerez)");
}

async function seedSitePages() {
  const count = await prisma.sitePage.count();
  if (count > 0) return;

  await prisma.sitePage.createMany({
    data: [
      { key: "home", label: "Anasayfa" },
      { key: "about", label: "Hakkımızda" },
      { key: "services", label: "Hizmetlerimiz" },
      { key: "products", label: "Ürünlerimiz" },
      { key: "projects", label: "Projelerimiz" },
      { key: "references", label: "Referanslarımız" },
      { key: "career", label: "Kariyer" },
      { key: "contact", label: "İletişim" },
      { key: "blog", label: "Blog" },
    ],
  });
  console.log("✔ SitePage seed edildi (9 kayıt)");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
