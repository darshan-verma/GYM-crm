-- Add ANNOUNCEMENT to InAppNotificationType enum
ALTER TYPE "InAppNotificationType" ADD VALUE IF NOT EXISTS 'ANNOUNCEMENT';

-- Create Announcement tables
CREATE TABLE IF NOT EXISTS "Announcement" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" JSONB NOT NULL,
  "ctaText" TEXT,
  "ctaLink" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Announcement_createdAt_idx" ON "Announcement"("createdAt");

CREATE TABLE IF NOT EXISTS "AnnouncementImage" (
  "id" TEXT NOT NULL,
  "announcementId" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "position" INTEGER NOT NULL,

  CONSTRAINT "AnnouncementImage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AnnouncementImage_announcementId_idx" ON "AnnouncementImage"("announcementId");

ALTER TABLE "AnnouncementImage"
  ADD CONSTRAINT "AnnouncementImage_announcementId_fkey"
  FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

