"use server";

import prisma from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { PaymentMode } from "@prisma/client";

export async function createPayment(data: {
	memberId: string;
	amount: number;
	paymentMode: PaymentMode;
	notes?: string;
	membershipId?: string;
	gstNumber?: string;
	gstPercentage?: number;
}) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");

	try {
		// Handle membershipId - treat "none" as no selection
		const membershipId =
			data.membershipId && data.membershipId !== "none"
				? data.membershipId
				: undefined;
		// Get member details
		const member = await prisma.member.findUnique({
			where: { id: data.memberId },
			include: {
				memberships: {
					where: { active: true },
					include: { plan: true },
					take: 1,
				},
			},
		});

		if (!member) throw new Error("Member not found");

		// Generate invoice number
		const today = new Date();
		const year = today.getFullYear();
		const month = String(today.getMonth() + 1).padStart(2, "0");

		const lastPayment = await prisma.payment.findFirst({
			where: {
				invoiceNumber: {
					startsWith: `INV${year}${month}`,
				},
			},
			orderBy: { createdAt: "desc" },
		});

		const sequence = lastPayment
			? parseInt(lastPayment.invoiceNumber.slice(-5)) + 1
			: 1;

		const invoiceNumber = `INV${year}${month}${String(sequence).padStart(
			5,
			"0"
		)}`;

		// Generate transaction ID
		const lastTxnPayment = await prisma.payment.findFirst({
			where: {
				transactionId: {
					startsWith: `TXN${year}${month}`,
				},
			},
			orderBy: { createdAt: "desc" },
		});

		const txnSequence = lastTxnPayment
			? parseInt(lastTxnPayment.transactionId!.slice(-5)) + 1
			: 1;

		const transactionId = `TXN${year}${month}${String(txnSequence).padStart(
			5,
			"0"
		)}`;

		// Calculate GST amount if GST percentage is provided
		let gstAmount: number | undefined;
		let totalAmount = data.amount;
		if (data.gstPercentage && data.gstPercentage > 0) {
			gstAmount = (data.amount * data.gstPercentage) / 100;
			totalAmount = data.amount + gstAmount;
		}

		// Create payment record
		const payment = await prisma.payment.create({
			data: {
				memberId: data.memberId,
				amount: totalAmount,
				paymentMode: data.paymentMode,
				transactionId,
				notes: data.notes,
				invoiceNumber,
				gstNumber: data.gstNumber,
				gstPercentage: data.gstPercentage,
				gstAmount: gstAmount,
				createdBy: session.user.id,
				paymentDate: new Date(),
			},
			include: {
				member: true,
			},
		});

		// Update membership if this is a renewal
		if (membershipId) {
			const membership = await prisma.membership.findUnique({
				where: { id: membershipId },
				include: { plan: true },
			});

			if (membership && membership.endDate < new Date()) {
				// Extend membership
				const newEndDate = new Date(membership.endDate);
				newEndDate.setDate(newEndDate.getDate() + membership.plan.duration);

				await prisma.membership.update({
					where: { id: data.membershipId },
					data: {
						endDate: newEndDate,
						active: true,
					},
				});

				// Update member status
				await prisma.member.update({
					where: { id: data.memberId },
					data: { status: "ACTIVE" },
				});
			}
		}

		// Log activity
		await prisma.activityLog.create({
			data: {
				userId: session.user.id,
				action: "CREATE",
				entity: "Payment",
				entityId: payment.id,
				details: {
					amount: totalAmount,
					invoiceNumber,
					memberName: member.name,
				},
			},
		});

		revalidatePath("/billing");
		revalidatePath("/billing/payments");
		revalidatePath(`/members/${data.memberId}`);

		// Serialize the payment data to convert Decimal objects to plain numbers
		const serializedPayment = JSON.parse(JSON.stringify(payment));

		return { success: true, data: serializedPayment };
	} catch (error) {
		console.error("Payment error:", error);
		return { success: false, error: "Failed to process payment" };
	}
}

export async function getPayment(id: string) {
	return await prisma.payment.findUnique({
		where: { id },
		include: {
			member: {
				include: {
					memberships: {
						where: { active: true },
						include: { plan: true },
					},
				},
			},
		},
	});
}

export async function getPayments(params?: {
	memberId?: string;
	startDate?: string;
	endDate?: string;
	mode?: PaymentMode;
	search?: string;
	page?: number;
	limit?: number;
}) {
	const {
		memberId,
		startDate,
		endDate,
		mode,
		search,
		page = 1,
		limit = 50,
	} = params || {};

	const where: Record<string, unknown> = {};

	if (memberId) {
		where.memberId = memberId;
	}

	if (mode) {
		where.paymentMode = mode;
	}

	if (startDate && endDate) {
		where.paymentDate = {
			gte: new Date(startDate),
			lte: new Date(endDate),
		};
	}

	if (search) {
		where.OR = [
			{ invoiceNumber: { contains: search, mode: "insensitive" } },
			{ transactionId: { contains: search, mode: "insensitive" } },
			{ member: { name: { contains: search, mode: "insensitive" } } },
			{ member: { phone: { contains: search } } },
		];
	}

	const [payments, total] = await Promise.all([
		prisma.payment.findMany({
			where,
			include: {
				member: {
					select: {
						id: true,
						name: true,
						membershipNumber: true,
						phone: true,
					},
				},
			},
			orderBy: { paymentDate: "desc" },
			skip: (page - 1) * limit,
			take: limit,
		}),
		prisma.payment.count({ where }),
	]);

	// Calculate totals
	const totalAmount = await prisma.payment.aggregate({
		where,
		_sum: { amount: true },
	});

	return {
		payments,
		total,
		totalAmount: Number(totalAmount._sum.amount || 0),
		pages: Math.ceil(total / limit),
		currentPage: page,
	};
}

export async function getPaymentStats(
	period: "today" | "week" | "month" | "year" = "month"
) {
	const now = new Date();
	let startDate: Date;

	switch (period) {
		case "today":
			startDate = new Date(now.setHours(0, 0, 0, 0));
			break;
		case "week":
			startDate = new Date(now.setDate(now.getDate() - 7));
			break;
		case "month":
			startDate = new Date(now.setMonth(now.getMonth() - 1));
			break;
		case "year":
			startDate = new Date(now.setFullYear(now.getFullYear() - 1));
			break;
	}

	const [totalRevenue, paymentsByMode, recentPayments] = await Promise.all([
		prisma.payment.aggregate({
			where: {
				paymentDate: { gte: startDate },
			},
			_sum: { amount: true },
			_count: true,
		}),
		prisma.payment.groupBy({
			by: ["paymentMode"],
			where: {
				paymentDate: { gte: startDate },
			},
			_sum: { amount: true },
			_count: true,
		}),
		prisma.payment.findMany({
			where: {
				paymentDate: { gte: startDate },
			},
			include: {
				member: { select: { name: true, membershipNumber: true } },
			},
			orderBy: { paymentDate: "desc" },
			take: 10,
		}),
	]);

	return {
		totalRevenue: Number(totalRevenue._sum.amount || 0),
		totalTransactions: totalRevenue._count,
		averageTransaction:
			totalRevenue._count > 0
				? Number(totalRevenue._sum.amount || 0) / totalRevenue._count
				: 0,
		paymentsByMode,
		recentPayments,
	};
}
