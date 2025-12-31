"use server";

import prisma from "@/lib/db/prisma";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export async function getRevenueReport(months: number = 6) {
	const now = new Date();
	const monthlyData = [];

	for (let i = months - 1; i >= 0; i--) {
		const date = subMonths(now, i);
		const start = startOfMonth(date);
		const end = endOfMonth(date);

		const [payments, count] = await Promise.all([
			prisma.payment.aggregate({
				where: {
					paymentDate: {
						gte: start,
						lte: end,
					},
				},
				_sum: { amount: true },
			}),
			prisma.payment.count({
				where: {
					paymentDate: {
						gte: start,
						lte: end,
					},
				},
			}),
		]);

		monthlyData.push({
			month: format(date, "MMM yyyy"),
			revenue: Number(payments._sum.amount || 0),
			count,
		});
	}

	return monthlyData;
}

export async function getPaymentModeDistribution() {
	const payments = await prisma.payment.groupBy({
		by: ["paymentMode"],
		_sum: { amount: true },
		_count: true,
	});

	return payments.map((p) => ({
		mode: p.paymentMode,
		amount: Number(p._sum.amount || 0),
		count: p._count,
	}));
}

export async function getTopRevenueByPlan() {
	// Get active memberships with their plan details
	const memberships = await prisma.membership.findMany({
		where: { active: true },
		include: {
			plan: true,
		},
	});

	// Aggregate by plan
	const planRevenue = memberships.reduce(
		(
			acc: Record<string, { name: string; revenue: number; count: number }>,
			membership
		) => {
			const planName = membership.plan.name;
			if (!acc[planName]) {
				acc[planName] = {
					name: planName,
					revenue: 0,
					count: 0,
				};
			}
			acc[planName].revenue += Number(membership.finalAmount);
			acc[planName].count += 1;
			return acc;
		},
		{}
	);

	return Object.values(planRevenue)
		.sort(
			(a: { revenue: number }, b: { revenue: number }) => b.revenue - a.revenue
		)
		.slice(0, 5);
}

export async function getMembershipReport(months: number = 6) {
	const now = new Date();
	const monthlyData = [];

	for (let i = months - 1; i >= 0; i--) {
		const date = subMonths(now, i);
		const start = startOfMonth(date);
		const end = endOfMonth(date);

		const [newMembers, activeMembers, expiredMembers] = await Promise.all([
			prisma.member.count({
				where: {
					joiningDate: {
						gte: start,
						lte: end,
					},
				},
			}),
			prisma.member.count({
				where: {
					status: "ACTIVE",
					joiningDate: {
						lte: end,
					},
				},
			}),
			prisma.member.count({
				where: {
					status: "EXPIRED",
					updatedAt: {
						gte: start,
						lte: end,
					},
				},
			}),
		]);

		monthlyData.push({
			month: format(date, "MMM yyyy"),
			newMembers,
			activeMembers,
			expiredMembers,
		});
	}

	return monthlyData;
}

export async function getMembershipStatusDistribution() {
	const distribution = await prisma.member.groupBy({
		by: ["status"],
		_count: true,
	});

	return distribution.map((d) => ({
		status: d.status,
		count: d._count,
	}));
}

export async function getAttendanceReport(months: number = 6) {
	const now = new Date();
	const monthlyData = [];

	for (let i = months - 1; i >= 0; i--) {
		const date = subMonths(now, i);
		const start = startOfMonth(date);
		const end = endOfMonth(date);

		const [totalCheckIns, uniqueMembers, avgDuration] = await Promise.all([
			prisma.attendance.count({
				where: {
					date: {
						gte: start,
						lte: end,
					},
				},
			}),
			prisma.attendance.findMany({
				where: {
					date: {
						gte: start,
						lte: end,
					},
				},
				distinct: ["memberId"],
				select: { memberId: true },
			}),
			prisma.attendance.aggregate({
				where: {
					date: {
						gte: start,
						lte: end,
					},
					duration: { not: null },
				},
				_avg: { duration: true },
			}),
		]);

		monthlyData.push({
			month: format(date, "MMM yyyy"),
			checkIns: totalCheckIns,
			uniqueMembers: uniqueMembers.length,
			avgDuration: Math.round(avgDuration._avg.duration || 0),
		});
	}

	return monthlyData;
}

export async function getAttendanceByDayOfWeek() {
	const now = new Date();
	const start = subMonths(now, 1); // Last month

	const attendances = await prisma.attendance.findMany({
		where: {
			date: { gte: start },
		},
		select: { date: true },
	});

	const dayDistribution = attendances.reduce(
		(acc: Record<string, number>, record) => {
			const day = new Date(record.date).toLocaleDateString("en-US", {
				weekday: "short",
			});
			acc[day] = (acc[day] || 0) + 1;
			return acc;
		},
		{}
	);

	const daysOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
	return daysOrder.map((day) => ({
		day,
		count: dayDistribution[day] || 0,
	}));
}

export async function getLeadsReport(months: number = 6) {
	const now = new Date();
	const monthlyData = [];

	for (let i = months - 1; i >= 0; i--) {
		const date = subMonths(now, i);
		const start = startOfMonth(date);
		const end = endOfMonth(date);

		const [newLeads, converted, lost] = await Promise.all([
			prisma.lead.count({
				where: {
					createdAt: {
						gte: start,
						lte: end,
					},
				},
			}),
			prisma.lead.count({
				where: {
					status: "CONVERTED",
					convertedDate: {
						gte: start,
						lte: end,
					},
				},
			}),
			prisma.lead.count({
				where: {
					status: "LOST",
					updatedAt: {
						gte: start,
						lte: end,
					},
				},
			}),
		]);

		monthlyData.push({
			month: format(date, "MMM yyyy"),
			newLeads,
			converted,
			lost,
			conversionRate:
				newLeads > 0 ? Math.round((converted / newLeads) * 100) : 0,
		});
	}

	return monthlyData;
}

export async function getLeadsBySource() {
	const leads = await prisma.lead.groupBy({
		by: ["source"],
		_count: true,
	});

	return leads.map((l) => ({
		source: l.source,
		count: l._count,
	}));
}

export async function getOverallStats() {
	const now = new Date();
	const startOfCurrentMonth = startOfMonth(now);
	const startOfLastMonth = startOfMonth(subMonths(now, 1));

	const [
		totalMembers,
		activeMembers,
		currentMonthRevenue,
		lastMonthRevenue,
		currentMonthAttendance,
		lastMonthAttendance,
		totalLeads,
		convertedLeads,
	] = await Promise.all([
		prisma.member.count(),
		prisma.member.count({ where: { status: "ACTIVE" } }),
		prisma.payment.aggregate({
			where: { paymentDate: { gte: startOfCurrentMonth } },
			_sum: { amount: true },
		}),
		prisma.payment.aggregate({
			where: {
				paymentDate: {
					gte: startOfLastMonth,
					lt: startOfCurrentMonth,
				},
			},
			_sum: { amount: true },
		}),
		prisma.attendance.count({
			where: { date: { gte: startOfCurrentMonth } },
		}),
		prisma.attendance.count({
			where: {
				date: {
					gte: startOfLastMonth,
					lt: startOfCurrentMonth,
				},
			},
		}),
		prisma.lead.count(),
		prisma.lead.count({ where: { status: "CONVERTED" } }),
	]);

	const currentRevenue = Number(currentMonthRevenue._sum.amount || 0);
	const lastRevenue = Number(lastMonthRevenue._sum.amount || 0);
	const revenueGrowth =
		lastRevenue > 0
			? Math.round(((currentRevenue - lastRevenue) / lastRevenue) * 100)
			: 0;

	const attendanceGrowth =
		lastMonthAttendance > 0
			? Math.round(
					((currentMonthAttendance - lastMonthAttendance) /
						lastMonthAttendance) *
						100
			  )
			: 0;

	return {
		totalMembers,
		activeMembers,
		currentMonthRevenue: currentRevenue,
		revenueGrowth,
		currentMonthAttendance,
		attendanceGrowth,
		totalLeads,
		conversionRate:
			totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0,
	};
}
