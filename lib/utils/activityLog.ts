"use server";

import prisma from "@/lib/db/prisma";

/**
 * Safely create an activity log entry.
 * This function checks if the user exists before creating the log
 * to prevent foreign key constraint errors.
 */
export async function createActivityLog(data: {
  userId: string;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: unknown;
}) {
  try {
    // Verify user exists before creating activity log
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { id: true },
    });

    if (!user) {
      console.warn(`User ${data.userId} not found, skipping activity log creation`);
      return { success: false, error: "User not found" };
    }

    await prisma.activityLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId || null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        details: data.details as any,
      },
    });

    return { success: true };
  } catch (error) {
    console.warn("Failed to create activity log:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
