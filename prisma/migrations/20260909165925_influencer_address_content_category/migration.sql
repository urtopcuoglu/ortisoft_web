-- AlterTable
ALTER TABLE "influencers" ADD COLUMN     "address" TEXT,
ADD COLUMN     "contentCategoryId" TEXT;

-- CreateTable
CREATE TABLE "influencer_content_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "influencer_content_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "influencer_content_categories_name_key" ON "influencer_content_categories"("name");

-- CreateIndex
CREATE INDEX "influencers_contentCategoryId_idx" ON "influencers"("contentCategoryId");

-- AddForeignKey
ALTER TABLE "influencers" ADD CONSTRAINT "influencers_contentCategoryId_fkey" FOREIGN KEY ("contentCategoryId") REFERENCES "influencer_content_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
