-- CreateEnum
CREATE TYPE "MeetingType" AS ENUM ('EMAIL', 'IN_PERSON', 'PHONE');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "PaymentPeriod" AS ENUM ('ONE_TIME', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- AlterTable
ALTER TABLE "guide_contacts" ADD COLUMN     "becameActiveAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "client_meetings" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "type" "MeetingType" NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposals" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "status" "ProposalStatus" NOT NULL DEFAULT 'SENT',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "fileUrl" TEXT,
    "notes" TEXT,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_agreements" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT,
    "signedAt" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "client_agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "method" "PaymentMethod" NOT NULL,
    "period" "PaymentPeriod" NOT NULL DEFAULT 'ONE_TIME',
    "dueDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "client_meetings_contactId_idx" ON "client_meetings"("contactId");

-- CreateIndex
CREATE INDEX "client_meetings_type_idx" ON "client_meetings"("type");

-- CreateIndex
CREATE INDEX "proposals_contactId_idx" ON "proposals"("contactId");

-- CreateIndex
CREATE INDEX "proposals_status_idx" ON "proposals"("status");

-- CreateIndex
CREATE INDEX "client_agreements_contactId_idx" ON "client_agreements"("contactId");

-- CreateIndex
CREATE INDEX "payments_contactId_idx" ON "payments"("contactId");

-- CreateIndex
CREATE INDEX "payments_dueDate_idx" ON "payments"("dueDate");

-- AddForeignKey
ALTER TABLE "client_meetings" ADD CONSTRAINT "client_meetings_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "guide_contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_meetings" ADD CONSTRAINT "client_meetings_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "guide_contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_agreements" ADD CONSTRAINT "client_agreements_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "guide_contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "guide_contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
