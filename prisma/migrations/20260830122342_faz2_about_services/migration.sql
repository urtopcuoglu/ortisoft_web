-- CreateTable
CREATE TABLE "about_content" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'tr',
    "heroTitle" TEXT NOT NULL DEFAULT 'Hakkımızda',
    "heroSubtitle" TEXT NOT NULL,
    "aboutText" TEXT NOT NULL,
    "missionText" TEXT NOT NULL,
    "visionText" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "about_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'tr',
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "photoUrl" TEXT,
    "colorTheme" TEXT NOT NULL DEFAULT 'blue',
    "linkedinUrl" TEXT,
    "specialties" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'tr',
    "slug" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "features" JSONB NOT NULL,
    "colorTheme" TEXT NOT NULL DEFAULT 'blue',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "about_content_locale_key" ON "about_content"("locale");

-- CreateIndex
CREATE INDEX "team_members_locale_sortOrder_idx" ON "team_members"("locale", "sortOrder");

-- CreateIndex
CREATE INDEX "services_locale_sortOrder_idx" ON "services"("locale", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "services_locale_slug_key" ON "services"("locale", "slug");
