-- CreateTable
CREATE TABLE "influencer_platforms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "influencer_platforms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "influencers" (
    "id" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "recordDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "influencers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "influencer_social_accounts" (
    "id" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "profileUrl" TEXT,
    "followerCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "influencer_social_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "influencer_platforms_name_key" ON "influencer_platforms"("name");

-- CreateIndex
CREATE UNIQUE INDEX "influencer_platforms_slug_key" ON "influencer_platforms"("slug");

-- CreateIndex
CREATE INDEX "influencers_recordDate_idx" ON "influencers"("recordDate");

-- CreateIndex
CREATE INDEX "influencer_social_accounts_influencerId_idx" ON "influencer_social_accounts"("influencerId");

-- CreateIndex
CREATE INDEX "influencer_social_accounts_platformId_idx" ON "influencer_social_accounts"("platformId");

-- AddForeignKey
ALTER TABLE "influencer_social_accounts" ADD CONSTRAINT "influencer_social_accounts_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "influencers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "influencer_social_accounts" ADD CONSTRAINT "influencer_social_accounts_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "influencer_platforms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
