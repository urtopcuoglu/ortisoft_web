-- AlterTable
ALTER TABLE "services" ADD COLUMN     "pricingCurrency" TEXT NOT NULL DEFAULT 'TRY',
ADD COLUMN     "subServices" JSONB;

