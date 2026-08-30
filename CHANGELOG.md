# Changelog

Bu proje [Semantic Versioning](https://semver.org/) kullanır. Sürüm etiketleri (`git tag`) `main` dalı üzerinde, her faz/kilometre taşı tamamlandığında atılır.

## [0.9.0] - 2026-08-30 — Çoklu Dil, Kullanıcı Yönetimi, Panel Genişletmeleri

### Çoklu Dil (TR/EN) + Açık/Koyu Tema
- Çerez tabanlı hafif i18n sistemi (`lib/i18n`), `LocaleProvider`/`LocaleSwitcher`;
  Header/Footer/Sidebar tamamen çevirili. Kapsam bilinçli olarak paylaşılan
  kabukla sınırlı — tekil sayfa içerikleri ayrı bir işte ele alınabilir.
- `next-themes` ile açık/koyu tema, `ThemeToggle`; **panelin tamamı** (23 sayfa +
  13 form/bileşen, Mesajlar dahil) koyu temaya uyarlandı.

### Sertleştirme
- `/admin/settings`: şifre değiştirme; `/admin/audit-log`: salt-okunur denetim
  kaydı; giriş formunda e-posta bazlı kaba kuvvet koruması (5 deneme/15 dk).

### Resend E-posta Entegrasyonu
- Mesaj yanıtları ve yeni kullanıcı giriş bilgileri artık `RESEND_API_KEY`
  tanımlıysa otomatik e-postayla gönderiliyor; tanımsızsa sessizce mailto:
  yedeğine düşüyor (build'i asla çökertmez).

### Kullanıcı Yönetimi (`/admin/users`, sadece Yönetici rolü)
- Ad soyad, görev, departman, kişisel/şirket telefonu, rol (Yönetici/Editör),
  şifre; "Ekibe ekle" ile Hakkımızda > Ekip Üyeleri'ne otomatik bağlanma.
- Görev/Ad Soyad Kullanıcılar panelinden yönetilir, bağlı ekip üyesi kaydına
  tek yönlü senkronize edilir (Hakkımızda formunda o alanlar salt-okunur).
- Son admin silinemez/editöre düşürülemez; kendi hesabını silemezsin.

### Panel Dashboard
- Metrik kartları (mesaj/talep/kullanıcı/blog/ekip sayıları), talep türü ve
  mesaj durumu dağılım grafikleri, son eklenen yazı/sayfa/kullanıcı listeleri,
  güncel USD/TRY kuru (Frankfurter/ECB, saatlik yenilenir).
- Üst çubukta bildirim çanı — mevcut denetim kaydını kaynak olarak kullanır,
  ayrı bir tablo gerektirmez.

### Hizmetler — Dinamik Alt Hizmetler + Fiyatlandırma
- `Service.features` (düz metin listesi) kaldırıldı, yerine `subServices`
  geldi: sınırsız sayıda eklenip çıkarılabilen, her biri ad+açıklama+fiyat
  taşıyan alt hizmet listesi (admin formunda dinamik tekrarlayıcı ile).
- Ad+açıklama public `/services` sayfasında gösterilir, fiyat SADECE admin
  panelinde görünür. Her hizmet kartının altına "Bilgi Talep Et" butonu
  eklendi (`/contact`'a yönlendirir).
- Mesajlar listesine durum/talep türüne göre filtre eklendi.

## [0.8.0] - 2026-08-30 — Blog Modülü + Vercel Build Düzeltmeleri

### Blog Modülü
- `BlogPost` modeli (başlık, slug, özet, içerik, kapak görseli, etiketler, durum:
  Taslak/Planlandı/Yayında, SEO alanları)
- Admin `/admin/blog`: Tiptap zengin metin editörü + **canlı SEO Analiz Aracı**
  (Google SERP önizleme, karakter sayaçları, odak anahtar kelime kontrol listesi, skor)
- Public `/blog`: yayındaki yazılar, `generateMetadata()` ile gerçek SEO `<head>`'i
  (title/description/canonical/OG/Twitter) + `BlogPosting` JSON-LD
- **Grid/Liste görünüm anahtarı**, **kategori (etiket) filtresi**, **sayfa başına 10 yazı sayfalama**
- RSS feed (`/blog/rss.xml`)
- Navbar ve Footer'a "Blog" linki eklendi

### Sitemap/Robots — Native Next.js'e Geçiş
- `next-sitemap` paketi ve statik `public/sitemap*.xml`/`robots.txt` kaldırıldı
- `app/sitemap.ts` / `app/robots.ts`: artık yayındaki blog yazılarını ve
  sözleşmeleri de dinamik olarak içeriyor

### Vercel Build Düzeltmeleri (kanıtlanmış kök nedenler)
- `lib/supabase-admin.ts`: Supabase istemcisi modül yüklenirken (eager) oluşturuluyordu —
  `SUPABASE_URL` tanımsızken build'i çöktürüyordu. Tembel (lazy, Proxy tabanlı) hale getirildi.
- `lib/session.ts`: `SESSION_SECRET` kontrolü modül seviyesindeydi, aynı şekilde build'i
  çöktürüyordu (muhtemelen Faz 1'den beri asıl sebep). Tembel hale getirildi.
- `next.config.ts`: dış görsel URL'lerine (`images.remotePatterns`) izin verilmemişti —
  admin panelinden harici bir link girilseydi sayfa patlardı, düzeltildi.
- Yerelde hem env değişkenleriyle hem olmadan `next build` çalıştırılarak doğrulandı.

### Notlar
- Vercel'de hâlâ eksik olan: `DATABASE_URL`, `SESSION_SECRET`, `SUPABASE_URL`,
  `SUPABASE_SERVICE_ROLE_KEY` ortam değişkenlerinin dashboard'a eklenmesi (kullanıcı
  tarafından yapılacak, kod tarafında yapılabilecek başka bir şey kalmadı).

## [0.7.0] - 2026-08-30 — Faz 2 Tamamlandı + Sözleşme & Sayfa Yönetimi

### Faz 2 (bölüm 5): Mesajlar Modülü
- `ContactMessage`/`MessageReply` modelleri, gerçek Server Action'a bağlı iletişim formu
  (öncesi sahteydi, hiçbir yere kaydetmiyordu)
- Admin gelen kutusu `/admin/messages`, durum yönetimi (Yeni/İşlemde/Yanıtlandı/Kapalı),
  yanıt kaydı + `mailto:` taslağı (gerçek e-posta gönderimi ileride eklenecek)
- Honeypot tabanlı spam koruması (sıfır ek servis)

### İletişim Formu Genişletmesi: Talep Türü, CV Yükleme, KVKK Onayı
- "Talebiniz" dropdown'ı (Bilgi/Destek/Hizmet/Ortaklık/CV) + koşullu alanlar
  (Hizmet → Şirket+Hizmet dropdown'u, CV → dosya yükleme)
- Supabase Storage'da **private bucket** (`cvs`) — CV'ler imzalı URL ile indirilir,
  herkese açık erişilemez; admin > Kariyer > Aday CV'leri (`/admin/career/cvs`)
- KVKK onay checkbox'ı — hem client hem sunucu tarafında zorunlu (iki katmanlı)

### Sözleşme Yönetimi
- `Contract` modeli + Tiptap tabanlı zengin metin editörü, admin CRUD (`/admin/contracts`)
- Her sözleşme Footer'da (sabit konum, eski statik Gizlilik/Kullanım Koşulları linklerinin
  yerinde) otomatik listelenir ve kendi `/contracts/[slug]` sayfasına sahiptir
- KVKK bu sisteme taşındı; Gizlilik Politikası ve Çerez Politikası ile birlikte 3 sözleşme
  seed edildi (hepsi "TASLAK — hukuki incelemeden geçmemiştir" uyarısıyla)

### Sayfa Yönetimi (Coming Soon)
- `SitePage` modeli — 9 sayfa (Anasayfa + Hakkımızda/Hizmetlerimiz/Ürünlerimiz/
  Projelerimiz/Referanslarımız/Kariyer/İletişim/Blog), `/admin/pages` tablo + aç/kapa switch
- Açılan sayfa ziyaretçiye genel bir "Çok Yakında" ekranı gösterir — içerik güncellenirken
  yarım kalmış değişiklikler gizlenir
- Anasayfa (`"use client"`, animasyonlu sayaçlar) `components/home/HomePageContent.tsx`'e
  taşındı, `app/(public)/page.tsx` artık ince bir server-component sarmalayıcı

### Düzeltmeler
- Footer'daki "Kariyer" linki `/about#career`den `/career`'a güncellendi
- Admin sidebar linkleri `<a>`den `<Link>`'e çevrildi (lint hatası)
- Header.tsx'teki önceden var olan `setState`-in-effect uyarısı giderildi

### Notlar
- Vercel deploy'ları hâlâ ertelenmiş durumda (kullanıcı kararı) — geliştirme bitince ele alınacak.
- Sıradaki: Blog modülü (Faz 5). Müşteri yönetimi/Takvim en sona bırakıldı.

## [0.6.0] - 2026-08-30 — Faz 2 (bölüm 4): Projeler Modülü

### Eklenenler
- `Project` Prisma modeli — Ortisoft'un kendi ürünleri/hibe destekli girişimleri
  (slug, durum: Çok Yakında/Geliştiriliyor/Aktif, fon etiketi, tagline, açıklama,
  etiketler, özellikler, opsiyonel teknoloji yığını, ikon, renk teması, sıra)
- `lib/icon-map.tsx`'e Store/Leaf/Train eklendi; `lib/color-theme.ts`'e nötr `slate`
  teması ve proje kartlarına özel gradient/kenarlık/fon-rozeti eşlemesi eklendi
- `modules/projects/`: Zod şeması + CRUD Server Action'lar, AuditLog
- Admin UI: `/admin/projects` (liste + durum rozeti), `/admin/projects/new`, `/admin/projects/[id]/edit`
- Public `/projects` sayfasının kart bölümü artık DB'den okuyor (hero/takvim/CTA statik kaldı)
- Mevcut 3 proje (dükkanımbenim.com, GreenEco Map, RailMentor) seed ile birebir DB'ye taşındı

### Düzeltmeler
- Prisma'nın opsiyonel `Json?` alanına düz `null` yazılamadığı ortaya çıktı —
  `Prisma.JsonNull` sentinel'i kullanılacak şekilde `modules/projects/actions.ts`
  ve `prisma/seed.ts` düzeltildi.

### Notlar
- Şema doğrulama, `Json` alan + gerçek DB NULL round-trip'i ve admin/public sayfa
  erişimi test edildi.

## [0.5.0] - 2026-08-30 — Faz 2 (bölüm 3): Referanslar Modülü

### Eklenenler
- `Reference` Prisma modeli (clientName, description, logoUrl, projectLink, sortOrder)
- `modules/references/`: Zod şeması + CRUD Server Action'lar, AuditLog
- Admin UI: `/admin/references` (liste), `/admin/references/new`, `/admin/references/[id]/edit`
- **Karar:** `/references` "çok yakında" bekleme sayfasından gerçek bir listeye çevrildi
  (kullanıcı ile netleşti). Hem `/references` hem `/about` sayfasının referans bölümü
  artık aynı `Reference` tablosunu okuyor — tek veri kaynağı, tekrar yok.
- Mevcut 5 referans (Kasırga, Railmentor, Eatwellz, Gatem, Sosyolojik Müdahale)
  `prisma/seed.ts` ile birebir DB'ye taşındı.

### Notlar
- Şema doğrulama, DB round-trip ve admin/public sayfa erişimi test edildi.

## [0.4.0] - 2026-08-30 — Faz 2 (bölüm 2): Kariyer Modülü

### Eklenenler
- `CareerPosting` Prisma modeli (slug, açıklama, gereksinimler, konum, çalışma şekli,
  başvuru e-postası, durum: Taslak/Yayında/Kapalı, `publishedAt`)
- `modules/career/`: Zod şeması + CRUD Server Action'lar; Yayında'ya geçişte
  `publishedAt` otomatik damgalanır
- Admin UI: `/admin/career` (liste + durum rozeti), `/admin/career/new`, `/admin/career/[id]/edit`
- **Yeni public sayfa `/career`**: yayındaki ilanları listeler, `mailto:` ile başvuru,
  ilan yoksa açık başvuru CTA'sı
- Navbar "Hakkımızda" menüsüne "Kariyer" eklendi; About sayfasındaki gömülü kariyer
  bölümü sadeleştirilip `/career`'a yönlendirildi (veri tekrarı kaldırıldı)

### Notlar
- Sahte/örnek ilan seed edilmedi — canlıda yanlışlıkla gerçek ilan gibi görünmesin diye.
- Durum geçişleri (DRAFT→PUBLISHED→CLOSED) ve `Json` alan round-trip'i test edildi.

## [0.3.0] - 2026-08-30 — Faz 2 (bölüm 1): Hakkımızda + Hizmetler İçerik Modülleri

### Eklenenler
- `AboutContent` (hero/hakkımızda yazısı/misyon/vizyon, tekil kayıt), `TeamMember`,
  `Service` Prisma modelleri — hepsinde `locale` alanı Faz 4 için şimdiden hazır
- `lib/icon-map.tsx`, `lib/color-theme.ts`: admin panelinden ham Tailwind class'ı/kod
  girilmesini önleyen, sabit ikon ve renk teması eşlemeleri
- `modules/about/`, `modules/services/`: Zod şemaları + Server Action'lar (create/
  update/delete), her mutasyon `modules/shared/audit.ts` ile AuditLog'a yazılıyor
- Admin UI: `/admin/about` (sayfa metinleri + ekip üyesi CRUD), `/admin/services`
  (hizmet kartı CRUD) — ortak `DeleteForm`, `AboutContentForm`, `TeamMemberForm`,
  `ServiceForm` bileşenleri
- Public `/about` ve `/services` sayfaları artık veritabanından okuyor (önceden
  sabit kodluydu); mevcut içerik `prisma/seed.ts` ile birebir DB'ye taşındı
- Kapsam dışı bırakılanlar (bilinçli, kullanıcıyla netleşti): kilometre taşları
  (timeline), değerler kartları, referans/ortak logoları — statik kod olarak kaldı

### Notlar
- Zod şeması + Prisma Json alan round-trip'i ve DB yazma/okuma doğrudan test edildi;
  admin formlarının tarayıcıda tıklanarak son doğrulaması kullanıcıya bırakıldı.

## [0.2.0] - 2026-08-30 — Faz 1: Kimlik Doğrulama ve Admin Kabuğu

### Eklenenler
- Site yapısı `app/(public)` ve `app/(admin)` route group'larına ayrıldı — admin panelinin
  genel site tasarımıyla (Header/Footer/Sidebar) hiçbir ilişkisi yok
- `lib/session.ts`: `jose` ile imzalı JWT oturum çerezi (httpOnly, secure, sameSite=lax, 7 gün)
- `lib/password.ts`: Argon2id şifre hash'leme (`@node-rs/argon2`)
- `modules/shared/dal.ts`: `verifySession()` / `getCurrentUser()` — Data Access Layer,
  React `cache()` ile tekilleştirilmiş, gerçek yetkilendirme sınırı burası
- `modules/auth/`: `login`/`logout` Server Action'ları, Zod doğrulama şeması
- `proxy.ts`: `/admin/*` için optimistik (hızlı) oturum kontrolü ve yönlendirme
- Admin UI: `/admin/login` (bağımsız) ve `/admin/(protected)/dashboard` (sidebar+topbar kabuğu)
- `prisma/seed.ts` + `db:seed` script'i — ilk admin kullanıcısını oluşturur

### Notlar
- Yetkilendirme üç katmanlı: Proxy (optimistik) → DAL `verifySession()` (gerçek) → her
  Server Action kendi içinde tekrar kontrol eder (defense-in-depth).
- `prisma.config.ts`'in `datasource` tipi Prisma 7.10'da `directUrl` desteklemiyor
  (sadece `url`/`shadowDatabaseUrl`) — CLI için tek `url` doğrudan bağlantıyı gösterir.

## [0.1.0] - 2026-08-30 — Faz 0: Veritabanı Altyapısı

### Eklenenler
- Supabase PostgreSQL bağlantısı (Prisma 7 + `@prisma/adapter-pg` driver adapter modeli)
- İlk Prisma şeması: `User` (email, şifre hash, rol: ADMIN/EDITOR), `AuditLog`
- `prisma.config.ts`: CLI işlemleri (migrate/studio) doğrudan bağlantı (5432) üzerinden,
  uygulama çalışma zamanı ise `lib/prisma.ts` üzerinden pooler (6543) ile ayrıştırıldı
- `lib/prisma.ts`: tekil (singleton) Prisma Client, HMR-güvenli
- `.env.example`: gerekli ortam değişkenlerinin şablonu
- `npm run db:generate|db:migrate|db:deploy|db:push|db:studio` script'leri

### Notlar
- Supabase Transaction Pooler (6543, pgbouncer) Prisma'nın şema motoruyla (migrate/introspect)
  uyumsuz olduğundan, CLI işlemleri için Session/Direct bağlantı (5432) kullanılır.
- Detaylı yol haritası: bkz. proje planı dokümanı.
