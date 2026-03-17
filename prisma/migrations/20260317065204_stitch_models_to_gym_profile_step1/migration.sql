/*
  Warnings:

  - You are about to drop the column `gymId` on the `Promotion` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Promotion" DROP CONSTRAINT "Promotion_gymId_fkey";

-- DropIndex
DROP INDEX "Promotion_gymId_idx";

-- AlterTable
ALTER TABLE "ActivityLog" ADD COLUMN     "gymProfileId" TEXT;

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "gymProfileId" TEXT;

-- AlterTable
ALTER TABLE "DietPlan" ADD COLUMN     "gymProfileId" TEXT;

-- AlterTable
ALTER TABLE "InAppNotification" ADD COLUMN     "gymProfileId" TEXT;

-- AlterTable
ALTER TABLE "Membership" ADD COLUMN     "gymProfileId" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "gymProfileId" TEXT;

-- AlterTable
ALTER TABLE "Promotion" DROP COLUMN "gymId",
ADD COLUMN     "gymProfileId" TEXT;

-- AlterTable
ALTER TABLE "WorkoutPlan" ADD COLUMN     "gymProfileId" TEXT;

-- CreateIndex
CREATE INDEX "ActivityLog_gymProfileId_idx" ON "ActivityLog"("gymProfileId");

-- CreateIndex
CREATE INDEX "Attendance_gymProfileId_idx" ON "Attendance"("gymProfileId");

-- CreateIndex
CREATE INDEX "DietPlan_gymProfileId_idx" ON "DietPlan"("gymProfileId");

-- CreateIndex
CREATE INDEX "InAppNotification_gymProfileId_idx" ON "InAppNotification"("gymProfileId");

-- CreateIndex
CREATE INDEX "Membership_gymProfileId_idx" ON "Membership"("gymProfileId");

-- CreateIndex
CREATE INDEX "Payment_gymProfileId_idx" ON "Payment"("gymProfileId");

-- CreateIndex
CREATE INDEX "Promotion_gymProfileId_idx" ON "Promotion"("gymProfileId");

-- CreateIndex
CREATE INDEX "WorkoutPlan_gymProfileId_idx" ON "WorkoutPlan"("gymProfileId");

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_gymProfileId_fkey" FOREIGN KEY ("gymProfileId") REFERENCES "GymProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_gymProfileId_fkey" FOREIGN KEY ("gymProfileId") REFERENCES "GymProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_gymProfileId_fkey" FOREIGN KEY ("gymProfileId") REFERENCES "GymProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPlan" ADD CONSTRAINT "WorkoutPlan_gymProfileId_fkey" FOREIGN KEY ("gymProfileId") REFERENCES "GymProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DietPlan" ADD CONSTRAINT "DietPlan_gymProfileId_fkey" FOREIGN KEY ("gymProfileId") REFERENCES "GymProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_gymProfileId_fkey" FOREIGN KEY ("gymProfileId") REFERENCES "GymProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_gymProfileId_fkey" FOREIGN KEY ("gymProfileId") REFERENCES "GymProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InAppNotification" ADD CONSTRAINT "InAppNotification_gymProfileId_fkey" FOREIGN KEY ("gymProfileId") REFERENCES "GymProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
