# Changelog

Bu proje [Semantic Versioning](https://semver.org/) kullanır. Sürüm etiketleri (`git tag`) `main` dalı üzerinde, her faz/kilometre taşı tamamlandığında atılır.

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
