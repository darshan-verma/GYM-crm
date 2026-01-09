/*
  Warnings:

  - You are about to drop the column `goal` on the `DietPlan` table. All the data in the column will be lost.
  - You are about to drop the column `goal` on the `WorkoutPlan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DietPlan" DROP COLUMN "goal",
ADD COLUMN     "goalId" TEXT;

-- AlterTable
ALTER TABLE "WorkoutPlan" DROP COLUMN "goal",
ADD COLUMN     "goalId" TEXT;

-- CreateTable
CREATE TABLE "FitnessGoal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FitnessGoal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FitnessGoal_name_key" ON "FitnessGoal"("name");

-- CreateIndex
CREATE INDEX "FitnessGoal_name_idx" ON "FitnessGoal"("name");

-- CreateIndex
CREATE INDEX "DietPlan_goalId_idx" ON "DietPlan"("goalId");

-- CreateIndex
CREATE INDEX "WorkoutPlan_goalId_idx" ON "WorkoutPlan"("goalId");

-- AddForeignKey
ALTER TABLE "WorkoutPlan" ADD CONSTRAINT "WorkoutPlan_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "FitnessGoal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DietPlan" ADD CONSTRAINT "DietPlan_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "FitnessGoal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
