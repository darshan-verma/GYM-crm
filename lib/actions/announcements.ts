"use server";

import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { InAppNotificationStatus, InAppNotificationType, UserRole } from "@prisma/client";
import type { Session } from "next-auth";

export type AnnouncementImageInput = { id: string; url: string };

function requireSuperAdmin(session: Session | null) {
	if (!session) throw new Error("Unauthorized");
	if (session.user.role !== UserRole.SUPER_ADMIN) {
		throw new Error("Forbidden");
	}
}

export async function createAnnouncement(data: {
	title: string;
	description: unknown;
	images: AnnouncementImageInput[];
	ctaText?: string | null;
	ctaLink?: string | null;
}) {
	const session = await auth();
	requireSuperAdmin(session);

	const gyms = await prisma.gymProfile.findMany({ select: { id: true } });

	const announcement = await prisma.announcement.create({
		data: {
			title: data.title,
			description: data.description as object,
			ctaText: data.ctaText || null,
			ctaLink: data.ctaLink || null,
			images: {
				create: data.images.map((img, i) => ({
					imageUrl: img.url,
					position: i,
				})),
			},
		},
		include: { images: { orderBy: { position: "asc" } } },
	});

	if (gyms.length > 0) {
		await prisma.inAppNotification.createMany({
			data: gyms.map((g) => ({
				gymProfileId: g.id,
				type: InAppNotificationType.ANNOUNCEMENT,
				title: announcement.title,
				message: "New announcement from Super Admin",
				entityType: "Announcement",
				entityId: announcement.id,
				status: InAppNotificationStatus.UNREAD,
				metadata: {
					announcementId: announcement.id,
					images: announcement.images.map((img) => img.imageUrl),
					ctaText: announcement.ctaText,
					ctaLink: announcement.ctaLink,
				},
			})),
		});
	}

	revalidatePath("/announcements");
	return { success: true, id: announcement.id };
}

export async function getAnnouncements(params?: { page?: number; limit?: number }) {
	const session = await auth();
	requireSuperAdmin(session);

	const page = params?.page ?? 1;
	const limit = params?.limit ?? 20;
	const skip = (page - 1) * limit;

	const [announcements, total] = await Promise.all([
		prisma.announcement.findMany({
			include: { images: { orderBy: { position: "asc" } } },
			orderBy: { createdAt: "desc" },
			skip,
			take: limit,
		}),
		prisma.announcement.count(),
	]);

	return {
		announcements,
		total,
		pages: Math.ceil(total / limit),
		currentPage: page,
	};
}

export async function getAnnouncementById(id: string) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");

	// Any logged-in gym can view announcements (used from notifications)
	return prisma.announcement.findUnique({
		where: { id },
		include: { images: { orderBy: { position: "asc" } } },
	});
}

export async function updateAnnouncement(
	id: string,
	data: {
		title: string;
		description: unknown;
		images: AnnouncementImageInput[];
		ctaText?: string | null;
		ctaLink?: string | null;
	}
) {
	const session = await auth();
	requireSuperAdmin(session);

	const existing = await prisma.announcement.findUnique({
		where: { id },
		select: { id: true },
	});
	if (!existing) throw new Error("Announcement not found");

	await prisma.announcementImage.deleteMany({ where: { announcementId: id } });

	const updated = await prisma.announcement.update({
		where: { id },
		data: {
			title: data.title,
			description: data.description as object,
			ctaText: data.ctaText || null,
			ctaLink: data.ctaLink || null,
			images: {
				create: data.images.map((img, i) => ({
					imageUrl: img.url,
					position: i,
				})),
			},
		},
		include: { images: { orderBy: { position: "asc" } } },
	});

	// Update existing (non-dismissed) in-app notifications so gyms see updated title/thumbnail/cta
	await prisma.inAppNotification.updateMany({
		where: {
			type: InAppNotificationType.ANNOUNCEMENT,
			entityType: "Announcement",
			entityId: id,
			status: { not: InAppNotificationStatus.DISMISSED },
		},
		data: {
			title: updated.title,
			metadata: {
				announcementId: updated.id,
				images: updated.images.map((img) => img.imageUrl),
				ctaText: updated.ctaText,
				ctaLink: updated.ctaLink,
			},
		},
	});

	revalidatePath("/announcements");
	revalidatePath(`/announcements/${id}`);
	revalidatePath(`/announcements/${id}/edit`);
	return { success: true };
}

export async function deleteAnnouncement(id: string) {
	const session = await auth();
	requireSuperAdmin(session);

	const existing = await prisma.announcement.findUnique({
		where: { id },
		select: { id: true },
	});
	if (!existing) throw new Error("Announcement not found");

	await prisma.announcement.delete({ where: { id } });

	// Dismiss any in-app notifications referencing this announcement
	await prisma.inAppNotification.updateMany({
		where: {
			type: InAppNotificationType.ANNOUNCEMENT,
			entityType: "Announcement",
			entityId: id,
			status: { not: InAppNotificationStatus.DISMISSED },
		},
		data: {
			status: InAppNotificationStatus.DISMISSED,
			dismissedAt: new Date(),
		},
	});

	revalidatePath("/announcements");
	return { success: true };
}

