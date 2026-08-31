-- CreateEnum
CREATE TYPE "GuideRelationType" AS ENUM ('COZUM_ORTAGI', 'TEDARIKCI', 'POTANSIYEL_MUSTERI', 'AKTIF_MUSTERI', 'PASIF_MUSTERI', 'YETKILI_TEKNIK_SERVIS', 'MALI_MUHASEBE', 'DESTEK');

-- CreateTable
CREATE TABLE "guide_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guide_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guide_contacts" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "authorizedPerson" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "email" TEXT NOT NULL,
    "website" TEXT,
    "relatedUserId" TEXT,
    "relationType" "GuideRelationType" NOT NULL,
    "recordDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guide_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "guide_categories_name_key" ON "guide_categories"("name");

-- CreateIndex
CREATE INDEX "guide_contacts_categoryId_idx" ON "guide_contacts"("categoryId");

-- CreateIndex
CREATE INDEX "guide_contacts_relatedUserId_idx" ON "guide_contacts"("relatedUserId");

-- CreateIndex
CREATE INDEX "guide_contacts_relationType_idx" ON "guide_contacts"("relationType");

-- AddForeignKey
ALTER TABLE "guide_contacts" ADD CONSTRAINT "guide_contacts_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "guide_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guide_contacts" ADD CONSTRAINT "guide_contacts_relatedUserId_fkey" FOREIGN KEY ("relatedUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
