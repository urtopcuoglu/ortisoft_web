# Changelog

Bu proje [Semantic Versioning](https://semver.org/) kullanır. Sürüm etiketleri (`git tag`) `main` dalı üzerinde, her faz/kilometre taşı tamamlandığında atılır.

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
