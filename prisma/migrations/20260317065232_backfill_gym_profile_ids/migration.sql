-- Backfill gymProfileId across all gym-owned tables.
-- Strategy:
-- - Use activeGymProfileId from SystemSettings when present, else first GymProfile by createdAt.
-- - Derive child records (payments/attendance/etc.) from their related member/user where possible.

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
WHERE u."gymProfileId" IS NULL
  AND u."role" <> 'SUPER_ADMIN';

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

-- Derive from member
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

-- Derive from user
UPDATE "ActivityLog" al
SET "gymProfileId" = u."gymProfileId"
FROM "User" u
WHERE al."gymProfileId" IS NULL
  AND al."userId" = u."id";

-- Promotions / in-app notifications fallback to default gym (safe baseline)
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