-- CreateEnum
CREATE TYPE "MessagePurpose" AS ENUM ('INFO', 'SUPPORT', 'SERVICE', 'PARTNERSHIP', 'CV');

-- AlterTable
ALTER TABLE "contact_messages" ADD COLUMN     "cvFileName" TEXT,
ADD COLUMN     "cvFilePath" TEXT,
ADD COLUMN     "kvkkConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "purpose" "MessagePurpose" NOT NULL DEFAULT 'INFO';

-- CreateIndex
CREATE INDEX "contact_messages_purpose_idx" ON "contact_messages"("purpose");
