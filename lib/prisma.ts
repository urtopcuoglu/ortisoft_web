import "server-only";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7'de native query engine yok — bağlantı bir "driver adapter" üzerinden kurulur.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Next.js dev modunda modül yeniden yüklemeleri (HMR) her seferinde yeni bir
// PrismaClient/connection pool oluşturmasın diye global'e tek instance cache'lenir.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
