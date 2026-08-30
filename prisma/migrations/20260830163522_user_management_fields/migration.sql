-- AlterTable
ALTER TABLE "team_members" ADD COLUMN     "linkedUserId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "companyPhone" TEXT,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "personalPhone" TEXT,
ADD COLUMN     "title" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "team_members_linkedUserId_key" ON "team_members"("linkedUserId");

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_linkedUserId_fkey" FOREIGN KEY ("linkedUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

