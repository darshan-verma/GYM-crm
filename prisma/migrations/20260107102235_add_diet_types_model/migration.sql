/*
  Warnings:

  - You are about to drop the column `goalId` on the `DietPlan` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "DietPlan" DROP CONSTRAINT "DietPlan_goalId_fkey";

-- DropIndex
DROP INDEX "DietPlan_goalId_idx";

-- AlterTable
ALTER TABLE "DietPlan" DROP COLUMN "goalId",
ADD COLUMN     "dietTypeId" TEXT;

-- CreateTable
CREATE TABLE "DietType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DietType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DietType_name_key" ON "DietType"("name");

-- CreateIndex
CREATE INDEX "DietType_name_idx" ON "DietType"("name");

-- CreateIndex
CREATE INDEX "DietPlan_dietTypeId_idx" ON "DietPlan"("dietTypeId");

-- AddForeignKey
ALTER TABLE "DietPlan" ADD CONSTRAINT "DietPlan_dietTypeId_fkey" FOREIGN KEY ("dietTypeId") REFERENCES "DietType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
