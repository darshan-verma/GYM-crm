"use server";

import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { requireCurrentGymProfileId } from "@/lib/actions/gym-profiles";
import type { Session } from "next-auth";
import { subMonths, startOfMonth, endOfMonth, format, subDays, startOfDay } from "date-fns";

function assertSuperAdmin(session: Session | null) {
	if (!session) throw new Error("Unauthorized");
	if (session.user.role !== "SUPER_ADMIN") throw new Error("Forbidden");
}

function asNumber(value: unknown): number | undefined {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	return undefined;
}

function getAmountFromDetails(details: unknown): number | undefined {
	if (!details || typeof details !== "object") return undefined;
	const d = details as Record<string, unknown>;
	return asNumber(d.amount) ?? asNumber(d.finalAmount) ?? asNumber(d.total);
}

export type DashboardActivityType = "member" | "payment" | "attendance" | "trainer";
export type DashboardActivityItem = {
	id: string;
	type: DashboardActivityType;
	title: string;
	description: string;
	timestamp: string; // ISO
	user?: { name: string; avatar?: string };
	amount?: number;
};

export async function getGymDashboardStats(gymProfileId: string) {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const [
		totalMembers,
		activeMembers,
		todayAttendance,
		todayPayments,
		expiringThisWeek,
	] = await Promise.all([
		prisma.member.count({ where: { gymProfileId } }),
		prisma.member.count({ where: { gymProfileId, status: "ACTIVE" } }),
		prisma.attendance.count({ where: { gymProfileId, date: today } }),
		prisma.payment.aggregate({
			where: { gymProfileId, paymentDate: { gte: today } },
			_sum: { amount: true },
		}),
		prisma.membership.count({
			where: {
				gymProfileId,
				active: true,
				endDate: {
					lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
				},
			},
		}),
	]);

	return {
		totalMembers,
		activeMembers,
		todayAttendance,
		todayRevenue: Number(todayPayments._sum.amount || 0),
		expiringThisWeek,
	};
}

export async function getGymDashboardStatsForCurrentGym() {
	const session = (await auth()) as Session | null;
	if (!session) throw new Error("Unauthorized");
	const gymProfileId = await requireCurrentGymProfileId(session);
	return getGymDashboardStats(gymProfileId);
}

export async function getSuperAdminDashboardStats() {
	const session = (await auth()) as Session | null;
	assertSuperAdmin(session);

	const now = new Date();
	const startOfToday = new Date(now);
	startOfToday.setHours(0, 0, 0, 0);
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
	const startOfLast30Days = new Date(now);
	startOfLast30Days.setDate(startOfLast30Days.getDate() - 30);

	const [gymsCount, totalMembers, activeMembers, todayRevenueAgg, monthRevenueAgg, leadsTotal, leadsConverted] =
		await Promise.all([
			prisma.gymProfile.count(),
			prisma.member.count(),
			prisma.member.count({ where: { status: "ACTIVE" } }),
			prisma.payment.aggregate({
				where: { paymentDate: { gte: startOfToday } },
				_sum: { amount: true },
			}),
			prisma.payment.aggregate({
				where: { paymentDate: { gte: startOfMonth } },
				_sum: { amount: true },
			}),
			prisma.lead.count(),
			prisma.lead.count({ where: { status: "CONVERTED" } }),
		]);

	const todayRevenue = Number(todayRevenueAgg._sum.amount || 0);
	const monthRevenue = Number(monthRevenueAgg._sum.amount || 0);
	const conversionRate =
		leadsTotal > 0 ? Math.round((leadsConverted / leadsTotal) * 100) : 0;

	// Alerts: gyms with 0 revenue in last 30 days
	const gymsWithRevenue = await prisma.payment.groupBy({
		by: ["gymProfileId"],
		where: { paymentDate: { gte: startOfLast30Days } },
	});
	const gymsWithRevenueIds = gymsWithRevenue.map((g) => g.gymProfileId);
	const gymsWithNoRevenueLast30Days = await prisma.gymProfile.count({
		where: gymsWithRevenueIds.length ? { id: { notIn: gymsWithRevenueIds } } : {},
	});

	return {
		gymsCount,
		totalMembers,
		activeMembers,
		todayRevenue,
		monthRevenue,
		leadsTotal,
		leadsConverted,
		conversionRate,
		alerts: {
			gymsWithNoRevenueLast30Days,
		},
	};
}

export async function getTopGymsByRevenue(params?: {
	days?: number;
	limit?: number;
}) {
	const session = (await auth()) as Session | null;
	assertSuperAdmin(session);

	const days = params?.days ?? 30;
	const limit = params?.limit ?? 5;

	const since = new Date();
	since.setDate(since.getDate() - days);

	const grouped = await prisma.payment.groupBy({
		by: ["gymProfileId"],
		where: { paymentDate: { gte: since } },
		_sum: { amount: true },
		orderBy: { _sum: { amount: "desc" } },
		take: limit,
	});

	const ids = grouped.map((g) => g.gymProfileId);
	const gyms = await prisma.gymProfile.findMany({
		where: { id: { in: ids } },
		select: { id: true, name: true, phone: true, email: true },
	});
	const gymById = new Map(gyms.map((g) => [g.id, g]));

	return grouped.map((g) => ({
		gymProfileId: g.gymProfileId,
		gymName: gymById.get(g.gymProfileId)?.name ?? g.gymProfileId,
		phone: gymById.get(g.gymProfileId)?.phone ?? null,
		email: gymById.get(g.gymProfileId)?.email ?? null,
		revenue: Number(g._sum.amount || 0),
	}));
}

export async function getRecentActivityGlobal(limit: number = 20) {
	const session = (await auth()) as Session | null;
	assertSuperAdmin(session);

	const logs = await prisma.activityLog.findMany({
		orderBy: { createdAt: "desc" },
		take: limit,
		include: {
			user: { select: { name: true, avatar: true } },
			gymProfile: { select: { name: true } },
		},
	});

	return logs.map((log): DashboardActivityItem => {
		const entity = (log.entity || "").toLowerCase();
		const type: DashboardActivityType =
			entity.includes("payment")
				? "payment"
				: entity.includes("attendance")
					? "attendance"
					: entity.includes("trainer") || entity.includes("user")
						? "trainer"
						: "member";

		const amount = getAmountFromDetails(log.details);
		const title = `${log.action} ${log.entity}`;
		const description = `${log.gymProfile.name} • ${log.entity}${
			log.entityId ? ` (${log.entityId})` : ""
		}`;

		return {
			id: log.id,
			type,
			title,
			description,
			timestamp: log.createdAt.toISOString(),
			user: log.user?.name
				? { name: log.user.name, avatar: log.user.avatar ?? undefined }
				: undefined,
			amount,
		};
	});
}

export async function getRecentActivityForGymProfile(
	gymProfileId: string,
	limit: number = 20
) {
	const session = (await auth()) as Session | null;
	if (!session) throw new Error("Unauthorized");

	const isSuperAdmin = session.user.role === "SUPER_ADMIN";
	if (!isSuperAdmin) {
		const current = await requireCurrentGymProfileId(session);
		if (current !== gymProfileId) throw new Error("Forbidden");
	}

	const logs = await prisma.activityLog.findMany({
		where: { gymProfileId },
		orderBy: { createdAt: "desc" },
		take: limit,
		include: {
			user: { select: { name: true, avatar: true } },
		},
	});

	return logs.map((log): DashboardActivityItem => {
		const entity = (log.entity || "").toLowerCase();
		const type: DashboardActivityType =
			entity.includes("payment")
				? "payment"
				: entity.includes("attendance")
					? "attendance"
					: entity.includes("trainer") || entity.includes("user")
						? "trainer"
						: "member";

		const amount = getAmountFromDetails(log.details);
		const title = `${log.action} ${log.entity}`;
		const description = `${log.entity}${log.entityId ? ` (${log.entityId})` : ""}`;

		return {
			id: log.id,
			type,
			title,
			description,
			timestamp: log.createdAt.toISOString(),
			user: log.user?.name
				? { name: log.user.name, avatar: log.user.avatar ?? undefined }
				: undefined,
			amount,
		};
	});
}

export async function getSuperAdminRevenueChart(months: number = 6) {
	const session = (await auth()) as Session | null;
	assertSuperAdmin(session);

	const data: Array<{ month: string; revenue: number; transactions: number }> = [];

	for (let i = months - 1; i >= 0; i--) {
		const date = subMonths(new Date(), i);
		const start = startOfMonth(date);
		const end = endOfMonth(date);

		const agg = await prisma.payment.aggregate({
			where: { paymentDate: { gte: start, lte: end } },
			_sum: { amount: true },
			_count: true,
		});

		data.push({
			month: format(start, "MMM yyyy"),
			revenue: Number(agg._sum.amount || 0),
			transactions: agg._count,
		});
	}

	return data;
}

export async function getSuperAdminMemberStatusChart() {
	const session = (await auth()) as Session | null;
	assertSuperAdmin(session);

	const grouped = await prisma.member.groupBy({
		by: ["status"],
		_count: true,
	});

	return grouped.map((g) => ({
		name: g.status.charAt(0) + g.status.slice(1).toLowerCase(),
		value: g._count,
	}));
}

export async function getSuperAdminLeadsBreakdown() {
	const session = (await auth()) as Session | null;
	assertSuperAdmin(session);

	const [byStatus, bySource] = await Promise.all([
		prisma.lead.groupBy({ by: ["status"], _count: true }),
		prisma.lead.groupBy({ by: ["source"], _count: true }),
	]);

	return {
		byStatus: byStatus.map((g) => ({
			name: g.status.replace(/_/g, " "),
			value: g._count,
		})),
		bySource: bySource.map((g) => ({
			name: g.source.replace(/_/g, " "),
			value: g._count,
		})),
	};
}

export async function getSuperAdminAttendanceTrend(days: number = 14) {
	const session = (await auth()) as Session | null;
	assertSuperAdmin(session);

	const data: Array<{ date: string; checkIns: number }> = [];

	for (let i = days - 1; i >= 0; i--) {
		const day = startOfDay(subDays(new Date(), i));
		const count = await prisma.attendance.count({
			where: { date: day },
		});
		data.push({
			date: format(day, "dd MMM"),
			checkIns: count,
		});
	}

	return data;
}

export async function getSuperAdminMemberGrowth(months: number = 6) {
	const session = (await auth()) as Session | null;
	assertSuperAdmin(session);

	const data: Array<{ month: string; newMembers: number; totalMembers: number }> = [];

	for (let i = months - 1; i >= 0; i--) {
		const date = subMonths(new Date(), i);
		const start = startOfMonth(date);
		const end = endOfMonth(date);

		const [newMembers, totalMembers] = await Promise.all([
			prisma.member.count({ where: { joiningDate: { gte: start, lte: end } } }),
			prisma.member.count({ where: { joiningDate: { lte: end } } }),
		]);

		data.push({
			month: format(start, "MMM yyyy"),
			newMembers,
			totalMembers,
		});
	}

	return data;
}

export async function getSuperAdminPaymentModes() {
	const session = (await auth()) as Session | null;
	assertSuperAdmin(session);

	const startOfMonth_ = startOfMonth(new Date());

	const grouped = await prisma.payment.groupBy({
		by: ["paymentMode"],
		where: { paymentDate: { gte: startOfMonth_ } },
		_sum: { amount: true },
		_count: true,
	});

	return grouped.map((g) => ({
		name: g.paymentMode.replace(/_/g, " "),
		amount: Number(g._sum.amount || 0),
		count: g._count,
	}));
}
