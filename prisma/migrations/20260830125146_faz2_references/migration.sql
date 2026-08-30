-- CreateTable
CREATE TABLE "references" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'tr',
    "clientName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "logoUrl" TEXT,
    "projectLink" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "references_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "references_locale_sortOrder_idx" ON "references"("locale", "sortOrder");
