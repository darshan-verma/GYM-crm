-- CreateEnum
CREATE TYPE "InAppNotificationType" AS ENUM ('LEAD_FOLLOW_UP', 'PAYMENT_DUE', 'MEMBERSHIP_EXPIRING', 'NEW_MEMBER');

-- CreateEnum
CREATE TYPE "InAppNotificationStatus" AS ENUM ('UNREAD', 'READ', 'DISMISSED');

-- CreateTable
CREATE TABLE "InAppNotification" (
    "id" TEXT NOT NULL,
    "type" "InAppNotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "status" "InAppNotificationStatus" NOT NULL DEFAULT 'UNREAD',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "dismissedAt" TIMESTAMP(3),

    CONSTRAINT "InAppNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InAppNotification_status_idx" ON "InAppNotification"("status");

-- CreateIndex
CREATE INDEX "InAppNotification_type_idx" ON "InAppNotification"("type");

-- CreateIndex
CREATE INDEX "InAppNotification_entityType_entityId_idx" ON "InAppNotification"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "InAppNotification_createdAt_idx" ON "InAppNotification"("createdAt");
