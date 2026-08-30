-- CreateEnum
CREATE TYPE "CareerStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED');

-- CreateTable
CREATE TABLE "career_postings" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'tr',
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" JSONB NOT NULL,
    "location" TEXT NOT NULL,
    "employmentType" TEXT NOT NULL,
    "applyEmail" TEXT NOT NULL,
    "status" "CareerStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "career_postings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "career_postings_locale_status_idx" ON "career_postings"("locale", "status");

-- CreateIndex
CREATE UNIQUE INDEX "career_postings_locale_slug_key" ON "career_postings"("locale", "slug");
