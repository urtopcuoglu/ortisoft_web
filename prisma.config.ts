import { config } from "dotenv";
config({ path: ".env.local" });

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // NOT: Bu url, sadece Prisma CLI (migrate/db pull/studio) için kullanılır.
    // Uygulamanın çalışma zamanı bağlantısı lib/prisma.ts içinde ayrıca,
    // driver adapter ile DATABASE_URL (pooler, 6543) üzerinden kurulur.
    //
    // Supabase'in Transaction Pooler'ı (6543, pgbouncer) Prisma'nın şema
    // motoruyla (introspection/migration) uyumsuz olduğu için CLI her zaman
    // doğrudan bağlantıyı (5432) kullanır. (Prisma 7.10'da datasource config
    // tipi sadece `url`/`shadowDatabaseUrl` destekliyor — `directUrl` yok.)
    url: env("DIRECT_URL"),
  },
});
