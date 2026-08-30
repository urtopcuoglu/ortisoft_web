# Changelog

Bu proje [Semantic Versioning](https://semver.org/) kullanır. Sürüm etiketleri (`git tag`) `main` dalı üzerinde, her faz/kilometre taşı tamamlandığında atılır.

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
