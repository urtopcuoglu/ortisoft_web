-- CreateEnum
CREATE TYPE "PortfolioChannel" AS ENUM ('MESAJ', 'MAIL', 'TELEFON', 'YERINDE_ZIYARET');

-- AlterTable
ALTER TABLE "contact_messages" ADD COLUMN     "guideContactId" TEXT,
ADD COLUMN     "portfolioCustomerId" TEXT;

-- CreateTable
CREATE TABLE "portfolio_contact_statuses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portfolio_contact_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_customers" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "authorizedPerson" TEXT NOT NULL,
    "serviceId" TEXT,
    "description" TEXT,
    "filePath" TEXT,
    "fileName" TEXT,
    "address" TEXT,
    "companyEmail" TEXT,
    "companyPhone" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "currentStatusId" TEXT,
    "recordDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_contacts" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "channel" "PortfolioChannel" NOT NULL,
    "contactedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT NOT NULL,
    "remarks" TEXT,
    "statusId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "portfolio_contact_statuses_name_key" ON "portfolio_contact_statuses"("name");

-- CreateIndex
CREATE INDEX "portfolio_customers_isActive_idx" ON "portfolio_customers"("isActive");

-- CreateIndex
CREATE INDEX "portfolio_customers_currentStatusId_idx" ON "portfolio_customers"("currentStatusId");

-- CreateIndex
CREATE INDEX "portfolio_customers_serviceId_idx" ON "portfolio_customers"("serviceId");

-- CreateIndex
CREATE INDEX "portfolio_contacts_customerId_idx" ON "portfolio_contacts"("customerId");

-- CreateIndex
CREATE INDEX "portfolio_contacts_channel_idx" ON "portfolio_contacts"("channel");

-- CreateIndex
CREATE INDEX "portfolio_contacts_statusId_idx" ON "portfolio_contacts"("statusId");

-- CreateIndex
CREATE INDEX "contact_messages_portfolioCustomerId_idx" ON "contact_messages"("portfolioCustomerId");

-- CreateIndex
CREATE INDEX "contact_messages_guideContactId_idx" ON "contact_messages"("guideContactId");

-- AddForeignKey
ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_portfolioCustomerId_fkey" FOREIGN KEY ("portfolioCustomerId") REFERENCES "portfolio_customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_guideContactId_fkey" FOREIGN KEY ("guideContactId") REFERENCES "guide_contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_customers" ADD CONSTRAINT "portfolio_customers_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_customers" ADD CONSTRAINT "portfolio_customers_currentStatusId_fkey" FOREIGN KEY ("currentStatusId") REFERENCES "portfolio_contact_statuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_contacts" ADD CONSTRAINT "portfolio_contacts_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "portfolio_customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_contacts" ADD CONSTRAINT "portfolio_contacts_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "portfolio_contact_statuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_contacts" ADD CONSTRAINT "portfolio_contacts_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
