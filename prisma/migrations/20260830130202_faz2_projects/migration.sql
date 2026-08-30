-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('COMING_SOON', 'IN_DEVELOPMENT', 'ACTIVE');

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'tr',
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'COMING_SOON',
    "fundingLabel" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" JSONB NOT NULL,
    "icon" TEXT NOT NULL,
    "colorTheme" TEXT NOT NULL DEFAULT 'blue',
    "features" JSONB NOT NULL,
    "techStack" JSONB,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "projects_locale_sortOrder_idx" ON "projects"("locale", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "projects_locale_slug_key" ON "projects"("locale", "slug");
