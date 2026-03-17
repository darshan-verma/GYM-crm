-- Enforce gymProfileId is required everywhere (post-backfill).
-- Also change FK behavior from SET NULL to RESTRICT to prevent accidental orphaning.

WITH default_gym AS (
  SELECT COALESCE(
    (
      SELECT g."id"
      FROM "SystemSettings" s
      JOIN "GymProfile" g ON g."id" = s."value"::text
      WHERE s."key" = 'activeGymProfileId'
      LIMIT 1
    ),
    (SELECT "id" FROM "GymProfile" ORDER BY "createdAt" ASC LIMIT 1)
  ) AS "id"
)
UPDATE "User" u
SET "gymProfileId" = (SELECT "id" FROM default_gym)
WHERE u."gymProfileId" IS NULL;

WITH default_gym AS (
  SELECT COALESCE(
    (
      SELECT g."id"
      FROM "SystemSettings" s
      JOIN "GymProfile" g ON g."id" = s."value"::text
      WHERE s."key" = 'activeGymProfileId'
      LIMIT 1
    ),
    (SELECT "id" FROM "GymProfile" ORDER BY "createdAt" ASC LIMIT 1)
  ) AS "id"
)
UPDATE "Member" m
SET "gymProfileId" = (SELECT "id" FROM default_gym)
WHERE m."gymProfileId" IS NULL;

WITH default_gym AS (
  SELECT COALESCE(
    (
      SELECT g."id"
      FROM "SystemSettings" s
      JOIN "GymProfile" g ON g."id" = s."value"::text
      WHERE s."key" = 'activeGymProfileId'
      LIMIT 1
    ),
    (SELECT "id" FROM "GymProfile" ORDER BY "createdAt" ASC LIMIT 1)
  ) AS "id"
)
UPDATE "Lead" l
SET "gymProfileId" = (SELECT "id" FROM default_gym)
WHERE l."gymProfileId" IS NULL;

WITH default_gym AS (
  SELECT COALESCE(
    (
      SELECT g."id"
      FROM "SystemSettings" s
      JOIN "GymProfile" g ON g."id" = s."value"::text
      WHERE s."key" = 'activeGymProfileId'
      LIMIT 1
    ),
    (SELECT "id" FROM "GymProfile" ORDER BY "createdAt" ASC LIMIT 1)
  ) AS "id"
)
UPDATE "MembershipPlan" p
SET "gymProfileId" = (SELECT "id" FROM default_gym)
WHERE p."gymProfileId" IS NULL;

-- Derive children from member/user if still null
UPDATE "Payment" pay
SET "gymProfileId" = m."gymProfileId"
FROM "Member" m
WHERE pay."gymProfileId" IS NULL
  AND pay."memberId" = m."id";

UPDATE "Attendance" a
SET "gymProfileId" = m."gymProfileId"
FROM "Member" m
WHERE a."gymProfileId" IS NULL
  AND a."memberId" = m."id";

UPDATE "Membership" ms
SET "gymProfileId" = m."gymProfileId"
FROM "Member" m
WHERE ms."gymProfileId" IS NULL
  AND ms."memberId" = m."id";

UPDATE "WorkoutPlan" wp
SET "gymProfileId" = m."gymProfileId"
FROM "Member" m
WHERE wp."gymProfileId" IS NULL
  AND wp."memberId" = m."id";

UPDATE "DietPlan" dp
SET "gymProfileId" = m."gymProfileId"
FROM "Member" m
WHERE dp."gymProfileId" IS NULL
  AND dp."memberId" = m."id";

UPDATE "ActivityLog" al
SET "gymProfileId" = u."gymProfileId"
FROM "User" u
WHERE al."gymProfileId" IS NULL
  AND al."userId" = u."id";

WITH default_gym AS (
  SELECT COALESCE(
    (
      SELECT g."id"
      FROM "SystemSettings" s
      JOIN "GymProfile" g ON g."id" = s."value"::text
      WHERE s."key" = 'activeGymProfileId'
      LIMIT 1
    ),
    (SELECT "id" FROM "GymProfile" ORDER BY "createdAt" ASC LIMIT 1)
  ) AS "id"
)
UPDATE "Promotion" pr
SET "gymProfileId" = (SELECT "id" FROM default_gym)
WHERE pr."gymProfileId" IS NULL;

WITH default_gym AS (
  SELECT COALESCE(
    (
      SELECT g."id"
      FROM "SystemSettings" s
      JOIN "GymProfile" g ON g."id" = s."value"::text
      WHERE s."key" = 'activeGymProfileId'
      LIMIT 1
    ),
    (SELECT "id" FROM "GymProfile" ORDER BY "createdAt" ASC LIMIT 1)
  ) AS "id"
)
UPDATE "InAppNotification" n
SET "gymProfileId" = (SELECT "id" FROM default_gym)
WHERE n."gymProfileId" IS NULL;

-- Set NOT NULL
ALTER TABLE "User" ALTER COLUMN "gymProfileId" SET NOT NULL;
ALTER TABLE "Member" ALTER COLUMN "gymProfileId" SET NOT NULL;
ALTER TABLE "Lead" ALTER COLUMN "gymProfileId" SET NOT NULL;
ALTER TABLE "MembershipPlan" ALTER COLUMN "gymProfileId" SET NOT NULL;
ALTER TABLE "Membership" ALTER COLUMN "gymProfileId" SET NOT NULL;
ALTER TABLE "Payment" ALTER COLUMN "gymProfileId" SET NOT NULL;
ALTER TABLE "Attendance" ALTER COLUMN "gymProfileId" SET NOT NULL;
ALTER TABLE "WorkoutPlan" ALTER COLUMN "gymProfileId" SET NOT NULL;
ALTER TABLE "DietPlan" ALTER COLUMN "gymProfileId" SET NOT NULL;
ALTER TABLE "ActivityLog" ALTER COLUMN "gymProfileId" SET NOT NULL;
ALTER TABLE "Promotion" ALTER COLUMN "gymProfileId" SET NOT NULL;
ALTER TABLE "InAppNotification" ALTER COLUMN "gymProfileId" SET NOT NULL;

-- Update FK constraints to RESTRICT
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_gymProfileId_fkey";
ALTER TABLE "User" ADD CONSTRAINT "User_gymProfileId_fkey" FOREIGN KEY ("gymProfileId") REFERENCES "GymProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Member" DROP CONSTRAINT IF EXISTS "Member_gymProfileId_fkey";
ALTER TABLE "Member" ADD CONSTRAINT "Member_gymProfileId_fkey" FOREIGN KEY ("gymProfileId") REFERENCES "GymProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Lead" DROP CONSTRAINT IF EXISTS "Lead_gymProfileId_fkey";
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_gymProfileId_fkey" FOREIGN KEY ("gymProfileId") REFERENCES "GymProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "MembershipPlan" DROP CONSTRAINT IF EXISTS "MembershipPlan_gymProfileId_fkey";
ALTER TABLE "MembershipPlan" ADD CONSTRAINT "MembershipPlan_gymProfileId_fkey" FOREIGN KEY ("gymProfileId") REFERENCES "GymProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Membership" DROP CONSTRAINT IF EXISTS "Membership_gymProfileId_fkey";
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_gymProfileId_fkey" FOREIGN KEY ("gymProfileId") REFERENCES "GymProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Payment" DROP CONSTRAINT IF EXISTS "Payment_gymProfileId_fkey";
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_gymProfileId_fkey" FOREIGN KEY ("gymProfileId") REFERENCES "GymProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Attendance" DROP CONSTRAINT IF EXISTS "Attendance_gymProfileId_fkey";
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_gymProfileId_fkey" FOREIGN KEY ("gymProfileId") REFERENCES "GymProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "WorkoutPlan" DROP CONSTRAINT IF EXISTS "WorkoutPlan_gymProfileId_fkey";
ALTER TABLE "WorkoutPlan" ADD CONSTRAINT "WorkoutPlan_gymProfileId_fkey" FOREIGN KEY ("gymProfileId") REFERENCES "GymProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "DietPlan" DROP CONSTRAINT IF EXISTS "DietPlan_gymProfileId_fkey";
ALTER TABLE "DietPlan" ADD CONSTRAINT "DietPlan_gymProfileId_fkey" FOREIGN KEY ("gymProfileId") REFERENCES "GymProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ActivityLog" DROP CONSTRAINT IF EXISTS "ActivityLog_gymProfileId_fkey";
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_gymProfileId_fkey" FOREIGN KEY ("gymProfileId") REFERENCES "GymProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Promotion" DROP CONSTRAINT IF EXISTS "Promotion_gymProfileId_fkey";
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_gymProfileId_fkey" FOREIGN KEY ("gymProfileId") REFERENCES "GymProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "InAppNotification" DROP CONSTRAINT IF EXISTS "InAppNotification_gymProfileId_fkey";
ALTER TABLE "InAppNotification" ADD CONSTRAINT "InAppNotification_gymProfileId_fkey" FOREIGN KEY ("gymProfileId") REFERENCES "GymProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

