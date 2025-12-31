"use server";

import prisma from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";

export async function markAttendance(data: {
	memberId: string;
	checkIn?: Date;
	checkOut?: Date;
}) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");

	try {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		// Check if already checked in today
		const existing = await prisma.attendance.findUnique({
			where: {
				memberId_date: {
					memberId: data.memberId,
					date: today,
				},
			},
		});

		let attendance;

		if (existing) {
			// Update with check-out time
			if (!existing.checkOut && data.checkOut) {
				const duration = Math.floor(
					(data.checkOut.getTime() - existing.checkIn.getTime()) / (1000 * 60)
				);

				attendance = await prisma.attendance.update({
					where: { id: existing.id },
					data: {
						checkOut: data.checkOut,
						duration,
					},
				});
			} else {
				throw new Error("Already checked in today");
			}
		} else {
			// Create new check-in
			attendance = await prisma.attendance.create({
				data: {
					memberId: data.memberId,
					checkIn: data.checkIn || new Date(),
					date: today,
				},
			});
		}

		// Log activity
		await prisma.activityLog.create({
			data: {
				userId: session.user.id,
				action: existing ? "CHECKOUT" : "CHECKIN",
				entity: "Attendance",
				entityId: attendance.id,
				details: { memberId: data.memberId },
			},
		});

		revalidatePath("/attendance");
		revalidatePath(`/members/${data.memberId}`);

		return { success: true, data: attendance };
	} catch (error: unknown) {
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "Failed to mark attendance",
		};
	}
}

export async function quickCheckIn(membershipNumber: string) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");

	try {
		const member = await prisma.member.findUnique({
			where: { membershipNumber },
			include: {
				memberships: {
					where: { active: true },
					take: 1,
				},
			},
		});

		if (!member) {
			return { success: false, error: "Member not found" };
		}

		if (member.status !== "ACTIVE") {
			return { success: false, error: "Membership is not active" };
		}

		const result = await markAttendance({
			memberId: member.id,
			checkIn: new Date(),
		});

		return result;
	} catch (error: unknown) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

export async function getAttendance(params?: {
	memberId?: string;
	date?: Date;
	startDate?: Date;
	endDate?: Date;
	page?: number;
	limit?: number;
}) {
	const {
		memberId,
		date,
		startDate,
		endDate,
		page = 1,
		limit = 30,
	} = params || {};

	const where: Record<string, unknown> = {};

	if (memberId) {
		where.memberId = memberId;
	}

	if (date) {
		const targetDate = new Date(date);
		targetDate.setHours(0, 0, 0, 0);
		where.date = targetDate;
	} else if (startDate && endDate) {
		where.date = {
			gte: startDate,
			lte: endDate,
		};
	}

	const [records, total] = await Promise.all([
		prisma.attendance.findMany({
			where,
			include: {
				member: {
					select: {
						id: true,
						name: true,
						membershipNumber: true,
						photo: true,
					},
				},
			},
			orderBy: { date: "desc" },
			skip: (page - 1) * limit,
			take: limit,
		}),
		prisma.attendance.count({ where }),
	]);

	return {
		records,
		total,
		pages: Math.ceil(total / limit),
		currentPage: page,
	};
}

export async function getAttendanceStats(
	period: "today" | "week" | "month" = "today"
) {
	const now = new Date();
	let startDate: Date;
	let endDate: Date = new Date();

	switch (period) {
		case "today":
			startDate = new Date(now.setHours(0, 0, 0, 0));
			endDate = new Date(now.setHours(23, 59, 59, 999));
			break;
		case "week":
			startDate = startOfWeek(now);
			endDate = endOfWeek(now);
			break;
		case "month":
			startDate = startOfMonth(now);
			endDate = endOfMonth(now);
			break;
	}

	const [totalCheckIns, uniqueMembers, avgDuration] = await Promise.all([
		prisma.attendance.count({
			where: {
				date: { gte: startDate, lte: endDate },
			},
		}),
		prisma.attendance.findMany({
			where: {
				date: { gte: startDate, lte: endDate },
			},
			distinct: ["memberId"],
			select: { memberId: true },
		}),
		prisma.attendance.aggregate({
			where: {
				date: { gte: startDate, lte: endDate },
				duration: { not: null },
			},
			_avg: { duration: true },
		}),
	]);

	return {
		totalCheckIns,
		uniqueMembers: uniqueMembers.length,
		avgDuration: Math.round(avgDuration._avg.duration || 0),
	};
}
