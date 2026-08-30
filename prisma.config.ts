import { config } from "dotenv";
config({ path: ".env.local" });

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // NOT: Bu url, sadece Prisma CLI (migrate/db pull/studio) için kullanılır.
    // Uygulamanın çalışma zamanı bağlantısı lib/prisma.ts içinde ayrıca,
    // driver adapter ile DATABASE_URL (pooler, 6543) üzerinden kurulur.
    //
    // Supabase'in Transaction Pooler'ı (6543, pgbouncer) Prisma'nın şema
    // motoruyla (introspection/migration) uyumsuz olduğu için CLI her zaman
    // doğrudan bağlantıyı (5432) kullanır.
    url: env("DIRECT_URL"),
    directUrl: env("DIRECT_URL"),
  },
});
