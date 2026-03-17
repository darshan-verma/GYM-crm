-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "gymProfileId" TEXT;

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "gymProfileId" TEXT;

-- AlterTable
ALTER TABLE "MembershipPlan" ADD COLUMN     "gymProfileId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "gymProfileId" TEXT;

-- CreateIndex
CREATE INDEX "Lead_gymProfileId_idx" ON "Lead"("gymProfileId");

-- CreateIndex
CREATE INDEX "Member_gymProfileId_idx" ON "Member"("gymProfileId");

-- CreateIndex
CREATE INDEX "MembershipPlan_gymProfileId_idx" ON "MembershipPlan"("gymProfileId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_gymProfileId_fkey" FOREIGN KEY ("gymProfileId") REFERENCES "GymProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_gymProfileId_fkey" FOREIGN KEY ("gymProfileId") REFERENCES "GymProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipPlan" ADD CONSTRAINT "MembershipPlan_gymProfileId_fkey" FOREIGN KEY ("gymProfileId") REFERENCES "GymProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_gymProfileId_fkey" FOREIGN KEY ("gymProfileId") REFERENCES "GymProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
