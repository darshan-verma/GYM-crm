"use server";

import prisma from "@/lib/db/prisma";
import { InAppNotificationType, InAppNotificationStatus } from "@prisma/client";

export interface NotificationItem {
  id: string;
  type: InAppNotificationType;
  title: string;
  message: string;
  entityType: string;
  entityId: string | null;
  status: InAppNotificationStatus;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

// Helper function to transform Prisma notification to NotificationItem
function transformNotification(notification: {
  id: string;
  type: InAppNotificationType;
  title: string;
  message: string;
  entityType: string;
  entityId: string | null;
  status: InAppNotificationStatus;
  metadata: unknown;
  createdAt: Date;
  readAt: Date | null;
  dismissedAt: Date | null;
}): NotificationItem {
  // Convert metadata from JsonValue to Record<string, unknown> | null
  let metadata: Record<string, unknown> | null = null;
  if (notification.metadata !== null && typeof notification.metadata === "object" && !Array.isArray(notification.metadata)) {
    metadata = notification.metadata as Record<string, unknown>;
  }

  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    entityType: notification.entityType,
    entityId: notification.entityId,
    status: notification.status,
    metadata,
    createdAt: notification.createdAt,
  };
}

// Get all notifications grouped by type
export async function getNotifications() {
  try {
    const notifications = await prisma.inAppNotification.findMany({
      where: {
        status: {
          not: InAppNotificationStatus.DISMISSED,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    // Transform notifications to match NotificationItem type
    const transformedNotifications = notifications.map(transformNotification);

    const grouped = {
      leads: transformedNotifications.filter((n) => n.type === InAppNotificationType.LEAD_FOLLOW_UP),
      payments: transformedNotifications.filter((n) => n.type === InAppNotificationType.PAYMENT_DUE),
      members: transformedNotifications.filter(
        (n) =>
          n.type === InAppNotificationType.MEMBERSHIP_EXPIRING ||
          n.type === InAppNotificationType.NEW_MEMBER
      ),
    };

    return {
      success: true,
      data: grouped,
      total: notifications.length,
      unreadCount: notifications.filter((n) => n.status === InAppNotificationStatus.UNREAD).length,
    };
  } catch (error) {
    console.error("Get notifications error:", error);
    return {
      success: false,
      error: "Failed to fetch notifications",
      data: { leads: [], payments: [], members: [] },
      total: 0,
      unreadCount: 0,
    };
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
  try {
    await prisma.inAppNotification.update({
      where: { id: notificationId },
      data: {
        status: InAppNotificationStatus.READ,
        readAt: new Date(),
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Mark notification as read error:", error);
    return { success: false, error: "Failed to mark notification as read" };
  }
}

// Dismiss notification
export async function dismissNotification(notificationId: string) {
  try {
    await prisma.inAppNotification.update({
      where: { id: notificationId },
      data: {
        status: InAppNotificationStatus.DISMISSED,
        dismissedAt: new Date(),
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Dismiss notification error:", error);
    return { success: false, error: "Failed to dismiss notification" };
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead() {
  try {
    await prisma.inAppNotification.updateMany({
      where: {
        status: InAppNotificationStatus.UNREAD,
      },
      data: {
        status: InAppNotificationStatus.READ,
        readAt: new Date(),
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    return { success: false, error: "Failed to mark all notifications as read" };
  }
}

// Helper function to format time remaining
function formatTimeRemaining(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 0) {
    return "overdue";
  } else if (diffMins < 60) {
    return diffMins === 1 ? "1 minute" : `${diffMins} minutes`;
  } else if (diffHours < 24) {
    return diffHours === 1 ? "1 hour" : `${diffHours} hours`;
  } else {
    return diffDays === 1 ? "1 day" : `${diffDays} days`;
  }
}

// Check and create/update notifications for leads (2 hours before follow-up)
export async function checkLeadFollowUpNotifications() {
  try {
    const twoHoursFromNow = new Date();
    twoHoursFromNow.setHours(twoHoursFromNow.getHours() + 2);

    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    // Find leads with follow-up dates in the next 2 hours
    const leads = await prisma.lead.findMany({
      where: {
        followUpDate: {
          gte: oneHourAgo,
          lte: twoHoursFromNow,
        },
        status: {
          not: "CONVERTED",
        },
      },
    });

    const notificationsUpdated = [];

    for (const lead of leads) {
      if (!lead.followUpDate) continue;

      // Calculate actual time remaining
      const timeRemaining = formatTimeRemaining(lead.followUpDate);

      // Check if notification already exists
      const existing = await prisma.inAppNotification.findFirst({
        where: {
          type: InAppNotificationType.LEAD_FOLLOW_UP,
          entityType: "Lead",
          entityId: lead.id,
          status: {
            not: InAppNotificationStatus.DISMISSED,
          },
        },
      });

      if (existing) {
        // Update existing notification with current time remaining
        const updated = await prisma.inAppNotification.update({
          where: { id: existing.id },
          data: {
            message: `Follow up with ${lead.name} in ${timeRemaining}`,
            metadata: {
              leadName: lead.name,
              leadPhone: lead.phone,
              followUpDate: lead.followUpDate.toISOString(),
            },
          },
        });
        notificationsUpdated.push(updated);
      } else {
        // Create new notification
        const notification = await prisma.inAppNotification.create({
          data: {
            type: InAppNotificationType.LEAD_FOLLOW_UP,
            title: "Lead Follow-up Reminder",
            message: `Follow up with ${lead.name} in ${timeRemaining}`,
            entityType: "Lead",
            entityId: lead.id,
            metadata: {
              leadName: lead.name,
              leadPhone: lead.phone,
              followUpDate: lead.followUpDate.toISOString(),
            },
          },
        });
        notificationsUpdated.push(notification);
      }
    }

    // Remove notifications for leads that are no longer in the time window
    const leadIds = leads.map((l) => l.id);
    await prisma.inAppNotification.updateMany({
      where: {
        type: InAppNotificationType.LEAD_FOLLOW_UP,
        entityType: "Lead",
        entityId: {
          notIn: leadIds,
        },
        status: {
          not: InAppNotificationStatus.DISMISSED,
        },
      },
      data: {
        status: InAppNotificationStatus.DISMISSED,
        dismissedAt: new Date(),
      },
    });

    return { success: true, count: notificationsUpdated.length };
  } catch (error) {
    console.error("Check lead follow-up notifications error:", error);
    return { success: false, error: "Failed to check lead notifications" };
  }
}

// Check and create/update notifications for payment dues (3 days before membership expiry)
export async function checkPaymentDueNotifications() {
  try {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    threeDaysFromNow.setHours(23, 59, 59, 999);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find active memberships expiring in 3 days or less
    const memberships = await prisma.membership.findMany({
      where: {
        active: true,
        endDate: {
          gte: today,
          lte: threeDaysFromNow,
        },
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            membershipNumber: true,
          },
        },
        plan: {
          select: {
            name: true,
            price: true,
          },
        },
      },
    });

    const notificationsUpdated = [];

    for (const membership of memberships) {
      // Calculate actual time remaining
      const timeRemaining = formatTimeRemaining(membership.endDate);

      // Check if notification already exists
      const existing = await prisma.inAppNotification.findFirst({
        where: {
          type: InAppNotificationType.PAYMENT_DUE,
          entityType: "Payment",
          entityId: membership.id,
          status: {
            not: InAppNotificationStatus.DISMISSED,
          },
        },
      });

      if (existing) {
        // Update existing notification with current time remaining
        const updated = await prisma.inAppNotification.update({
          where: { id: existing.id },
          data: {
            message: `Payment due for ${membership.member.name} - Membership expires in ${timeRemaining}`,
            metadata: {
              memberName: membership.member.name,
              memberId: membership.member.id,
              membershipNumber: membership.member.membershipNumber,
              planName: membership.plan.name,
              amount: membership.finalAmount.toString(),
              endDate: membership.endDate.toISOString(),
            },
          },
        });
        notificationsUpdated.push(updated);
      } else {
        // Create new notification
        const notification = await prisma.inAppNotification.create({
          data: {
            type: InAppNotificationType.PAYMENT_DUE,
            title: "Payment Due Reminder",
            message: `Payment due for ${membership.member.name} - Membership expires in ${timeRemaining}`,
            entityType: "Payment",
            entityId: membership.id,
            metadata: {
              memberName: membership.member.name,
              memberId: membership.member.id,
              membershipNumber: membership.member.membershipNumber,
              planName: membership.plan.name,
              amount: membership.finalAmount.toString(),
              endDate: membership.endDate.toISOString(),
            },
          },
        });
        notificationsUpdated.push(notification);
      }
    }

    // Remove notifications for memberships that are no longer in the time window
    const membershipIds = memberships.map((m) => m.id);
    await prisma.inAppNotification.updateMany({
      where: {
        type: InAppNotificationType.PAYMENT_DUE,
        entityType: "Payment",
        entityId: {
          notIn: membershipIds,
        },
        status: {
          not: InAppNotificationStatus.DISMISSED,
        },
      },
      data: {
        status: InAppNotificationStatus.DISMISSED,
        dismissedAt: new Date(),
      },
    });

    return { success: true, count: notificationsUpdated.length };
  } catch (error) {
    console.error("Check payment due notifications error:", error);
    return { success: false, error: "Failed to check payment notifications" };
  }
}

// Check and create/update notifications for membership expiring (3 days before)
export async function checkMembershipExpiringNotifications() {
  try {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    threeDaysFromNow.setHours(23, 59, 59, 999);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find active memberships expiring in 3 days or less
    const memberships = await prisma.membership.findMany({
      where: {
        active: true,
        endDate: {
          gte: today,
          lte: threeDaysFromNow,
        },
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            membershipNumber: true,
          },
        },
        plan: {
          select: {
            name: true,
          },
        },
      },
    });

    const notificationsUpdated = [];

    for (const membership of memberships) {
      // Calculate actual time remaining
      const timeRemaining = formatTimeRemaining(membership.endDate);

      // Check if notification already exists
      const existing = await prisma.inAppNotification.findFirst({
        where: {
          type: InAppNotificationType.MEMBERSHIP_EXPIRING,
          entityType: "Member",
          entityId: membership.memberId,
          status: {
            not: InAppNotificationStatus.DISMISSED,
          },
        },
      });

      if (existing) {
        // Update existing notification with current time remaining
        const updated = await prisma.inAppNotification.update({
          where: { id: existing.id },
          data: {
            message: `${membership.member.name}'s membership expires in ${timeRemaining}`,
            metadata: {
              memberName: membership.member.name,
              membershipNumber: membership.member.membershipNumber,
              planName: membership.plan.name,
              endDate: membership.endDate.toISOString(),
            },
          },
        });
        notificationsUpdated.push(updated);
      } else {
        // Create new notification
        const notification = await prisma.inAppNotification.create({
          data: {
            type: InAppNotificationType.MEMBERSHIP_EXPIRING,
            title: "Membership Expiring Soon",
            message: `${membership.member.name}'s membership expires in ${timeRemaining}`,
            entityType: "Member",
            entityId: membership.memberId,
            metadata: {
              memberName: membership.member.name,
              membershipNumber: membership.member.membershipNumber,
              planName: membership.plan.name,
              endDate: membership.endDate.toISOString(),
            },
          },
        });
        notificationsUpdated.push(notification);
      }
    }

    // Remove notifications for memberships that are no longer in the time window
    const memberIds = memberships.map((m) => m.memberId);
    await prisma.inAppNotification.updateMany({
      where: {
        type: InAppNotificationType.MEMBERSHIP_EXPIRING,
        entityType: "Member",
        entityId: {
          notIn: memberIds,
        },
        status: {
          not: InAppNotificationStatus.DISMISSED,
        },
      },
      data: {
        status: InAppNotificationStatus.DISMISSED,
        dismissedAt: new Date(),
      },
    });

    return { success: true, count: notificationsUpdated.length };
  } catch (error) {
    console.error("Check membership expiring notifications error:", error);
    return { success: false, error: "Failed to check membership notifications" };
  }
}

// Create notification for new member
export async function createNewMemberNotification(memberId: string, memberName: string, membershipNumber: string) {
  try {
    // Check if notification already exists
    const existing = await prisma.inAppNotification.findFirst({
      where: {
        type: InAppNotificationType.NEW_MEMBER,
        entityType: "Member",
        entityId: memberId,
      },
    });

    if (existing) {
      return { success: true, notification: existing };
    }

    // Create notification
    const notification = await prisma.inAppNotification.create({
      data: {
        type: InAppNotificationType.NEW_MEMBER,
        title: "New Member Added",
        message: `New member ${memberName} (${membershipNumber}) has been added`,
        entityType: "Member",
        entityId: memberId,
        metadata: {
          memberName,
          membershipNumber,
        },
      },
    });

    return { success: true, notification };
  } catch (error) {
    console.error("Create new member notification error:", error);
    return { success: false, error: "Failed to create new member notification" };
  }
}

// Update notification for a specific lead when follow-up date changes
export async function updateLeadNotification(leadId: string) {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead || !lead.followUpDate) {
      // Remove notification if lead doesn't have follow-up date
      await prisma.inAppNotification.updateMany({
        where: {
          type: InAppNotificationType.LEAD_FOLLOW_UP,
          entityType: "Lead",
          entityId: leadId,
          status: {
            not: InAppNotificationStatus.DISMISSED,
          },
        },
        data: {
          status: InAppNotificationStatus.DISMISSED,
          dismissedAt: new Date(),
        },
      });
      return { success: true };
    }

    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Check if follow-up is within the notification window (1 hour ago to 2 hours from now)
    if (lead.followUpDate >= oneHourAgo && lead.followUpDate <= twoHoursFromNow) {
      const timeRemaining = formatTimeRemaining(lead.followUpDate);

      // Update or create notification
      const existing = await prisma.inAppNotification.findFirst({
        where: {
          type: InAppNotificationType.LEAD_FOLLOW_UP,
          entityType: "Lead",
          entityId: leadId,
          status: {
            not: InAppNotificationStatus.DISMISSED,
          },
        },
      });

      if (existing) {
        await prisma.inAppNotification.update({
          where: { id: existing.id },
          data: {
            message: `Follow up with ${lead.name} in ${timeRemaining}`,
            metadata: {
              leadName: lead.name,
              leadPhone: lead.phone,
              followUpDate: lead.followUpDate.toISOString(),
            },
          },
        });
      } else {
        await prisma.inAppNotification.create({
          data: {
            type: InAppNotificationType.LEAD_FOLLOW_UP,
            title: "Lead Follow-up Reminder",
            message: `Follow up with ${lead.name} in ${timeRemaining}`,
            entityType: "Lead",
            entityId: leadId,
            metadata: {
              leadName: lead.name,
              leadPhone: lead.phone,
              followUpDate: lead.followUpDate.toISOString(),
            },
          },
        });
      }
    } else {
      // Remove notification if outside window
      await prisma.inAppNotification.updateMany({
        where: {
          type: InAppNotificationType.LEAD_FOLLOW_UP,
          entityType: "Lead",
          entityId: leadId,
          status: {
            not: InAppNotificationStatus.DISMISSED,
          },
        },
        data: {
          status: InAppNotificationStatus.DISMISSED,
          dismissedAt: new Date(),
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Update lead notification error:", error);
    return { success: false, error: "Failed to update lead notification" };
  }
}

// Update notifications for a specific membership when end date changes
export async function updateMembershipNotifications(membershipId: string) {
  try {
    const membership = await prisma.membership.findUnique({
      where: { id: membershipId },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            membershipNumber: true,
          },
        },
        plan: {
          select: {
            name: true,
            price: true,
          },
        },
      },
    });

    if (!membership) {
      return { success: false, error: "Membership not found" };
    }

    if (!membership.active) {
      // Remove notifications if membership is not active
      await prisma.inAppNotification.updateMany({
        where: {
          OR: [
            {
              type: InAppNotificationType.PAYMENT_DUE,
              entityType: "Payment",
              entityId: membershipId,
            },
            {
              type: InAppNotificationType.MEMBERSHIP_EXPIRING,
              entityType: "Member",
              entityId: membership.memberId,
            },
          ],
          status: {
            not: InAppNotificationStatus.DISMISSED,
          },
        },
        data: {
          status: InAppNotificationStatus.DISMISSED,
          dismissedAt: new Date(),
        },
      });
      return { success: true };
    }

    const now = new Date();
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    threeDaysFromNow.setHours(23, 59, 59, 999);
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    // Check if membership expires within 3 days
    if (membership.endDate >= today && membership.endDate <= threeDaysFromNow) {
      const timeRemaining = formatTimeRemaining(membership.endDate);

      // Update or create payment due notification
      const existingPayment = await prisma.inAppNotification.findFirst({
        where: {
          type: InAppNotificationType.PAYMENT_DUE,
          entityType: "Payment",
          entityId: membershipId,
          status: {
            not: InAppNotificationStatus.DISMISSED,
          },
        },
      });

      if (existingPayment) {
        await prisma.inAppNotification.update({
          where: { id: existingPayment.id },
          data: {
            message: `Payment due for ${membership.member.name} - Membership expires in ${timeRemaining}`,
            metadata: {
              memberName: membership.member.name,
              memberId: membership.member.id,
              membershipNumber: membership.member.membershipNumber,
              planName: membership.plan.name,
              amount: membership.finalAmount.toString(),
              endDate: membership.endDate.toISOString(),
            },
          },
        });
      } else {
        await prisma.inAppNotification.create({
          data: {
            type: InAppNotificationType.PAYMENT_DUE,
            title: "Payment Due Reminder",
            message: `Payment due for ${membership.member.name} - Membership expires in ${timeRemaining}`,
            entityType: "Payment",
            entityId: membershipId,
            metadata: {
              memberName: membership.member.name,
              memberId: membership.member.id,
              membershipNumber: membership.member.membershipNumber,
              planName: membership.plan.name,
              amount: membership.finalAmount.toString(),
              endDate: membership.endDate.toISOString(),
            },
          },
        });
      }

      // Update or create membership expiring notification
      const existingMember = await prisma.inAppNotification.findFirst({
        where: {
          type: InAppNotificationType.MEMBERSHIP_EXPIRING,
          entityType: "Member",
          entityId: membership.memberId,
          status: {
            not: InAppNotificationStatus.DISMISSED,
          },
        },
      });

      if (existingMember) {
        await prisma.inAppNotification.update({
          where: { id: existingMember.id },
          data: {
            message: `${membership.member.name}'s membership expires in ${timeRemaining}`,
            metadata: {
              memberName: membership.member.name,
              membershipNumber: membership.member.membershipNumber,
              planName: membership.plan.name,
              endDate: membership.endDate.toISOString(),
            },
          },
        });
      } else {
        await prisma.inAppNotification.create({
          data: {
            type: InAppNotificationType.MEMBERSHIP_EXPIRING,
            title: "Membership Expiring Soon",
            message: `${membership.member.name}'s membership expires in ${timeRemaining}`,
            entityType: "Member",
            entityId: membership.memberId,
            metadata: {
              memberName: membership.member.name,
              membershipNumber: membership.member.membershipNumber,
              planName: membership.plan.name,
              endDate: membership.endDate.toISOString(),
            },
          },
        });
      }
    } else {
      // Remove notifications if outside window
      await prisma.inAppNotification.updateMany({
        where: {
          OR: [
            {
              type: InAppNotificationType.PAYMENT_DUE,
              entityType: "Payment",
              entityId: membershipId,
            },
            {
              type: InAppNotificationType.MEMBERSHIP_EXPIRING,
              entityType: "Member",
              entityId: membership.memberId,
            },
          ],
          status: {
            not: InAppNotificationStatus.DISMISSED,
          },
        },
        data: {
          status: InAppNotificationStatus.DISMISSED,
          dismissedAt: new Date(),
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Update membership notifications error:", error);
    return { success: false, error: "Failed to update membership notifications" };
  }
}

// Run all notification checks
export async function checkAllNotifications() {
  try {
    const [leadsResult, paymentsResult, membersResult] = await Promise.all([
      checkLeadFollowUpNotifications(),
      checkPaymentDueNotifications(),
      checkMembershipExpiringNotifications(),
    ]);

    return {
      success: true,
      leads: leadsResult.count || 0,
      payments: paymentsResult.count || 0,
      members: membersResult.count || 0,
    };
  } catch (error) {
    console.error("Check all notifications error:", error);
    return { success: false, error: "Failed to check notifications" };
  }
}
