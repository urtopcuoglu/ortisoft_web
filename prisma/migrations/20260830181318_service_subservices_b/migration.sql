-- AlterTable
ALTER TABLE "services" DROP COLUMN "features",
DROP COLUMN "internalPricing",
ALTER COLUMN "subServices" SET NOT NULL;

