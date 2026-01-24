"use server";

import prisma from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { PaymentMode } from "@prisma/client";
import { createActivityLog } from "@/lib/utils/activityLog";

export async function createPayment(data: {
	memberId: string;
	amount: number;
	paymentMode: PaymentMode;
	notes?: string;
	membershipId?: string;
	gstNumber?: string;
	gstPercentage?: number;
	discount?: number;
	nextDueAmount?: number;
	nextDueDate?: Date;
}) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");

	try {
		// Handle membershipId - treat "none" as no selection
		const membershipId =
			data.membershipId && data.membershipId !== "none"
				? data.membershipId
				: undefined;
			// Get member details with payments
		const member = await prisma.member.findUnique({
			where: { id: data.memberId },
			include: {
				memberships: {
					where: { active: true },
					include: { plan: true },
					take: 1,
				},
				payments: true,
			},
		});

		if (!member) throw new Error("Member not found");

		// Calculate remaining balance if member has active membership
		if (member.memberships.length > 0) {
			const activeMembership = member.memberships[0];
			const baseDue = Number(activeMembership.finalAmount); // Base amount (ex-GST)
			
			// Calculate total discounts and payments (excluding GST) from previous payments
			const totalDiscounts = member.payments.reduce(
				(sum, p) => sum + Number((p as { discount?: unknown }).discount || 0),
				0
			);
			const totalPaymentsExcludingGST = member.payments.reduce(
				(sum, p) => {
					const paymentAmount = Number(p.amount);
					const gstAmount = Number((p as { gstAmount?: unknown }).gstAmount || 0);
					return sum + (paymentAmount - gstAmount); // Payment excluding GST
				},
				0
			);
			
			// Remaining base due = Base Due - Discounts - Payments (excluding GST)
			const remainingBaseDue = baseDue - totalDiscounts - totalPaymentsExcludingGST;

			// Apply discount if provided
			const discountAmount = data.discount || 0;
			
			// Rule 2: Discount validation (MOST IMPORTANT)
			// Discount cannot be negative
			if (discountAmount < 0) {
				return {
					success: false,
					error: "Discount cannot be negative",
				};
			}
			
			// Discount cannot exceed remaining base due
			if (discountAmount > remainingBaseDue) {
				return {
					success: false,
					error: `Discount cannot exceed remaining base fee of ₹${remainingBaseDue.toFixed(2)}`,
				};
			}
			
			// Calculate taxable amount (Base Amount - Discount)
			// data.amount is the base amount entered by user
			const taxableAmount = Math.max(0, data.amount - discountAmount);
			
			// Rule 6: Validate settlement (never compare GST with Due)
			// payment_ex_gst <= base_due - discount
			if (taxableAmount + discountAmount > remainingBaseDue) {
				return {
					success: false,
					error: `Payment amount (₹${taxableAmount.toFixed(2)}) plus discount (₹${discountAmount.toFixed(2)}) exceeds remaining base fee (₹${remainingBaseDue.toFixed(2)})`,
				};
			}
		}

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

		// Calculate discount and GST following Golden Formula:
		// Discount reduces Base, GST applies after Discount, Payment settles Taxable + GST
		
		// Step 1: Apply discount to base amount
		const discountAmount = data.discount || 0;
		const baseAmount = data.amount; // Base amount (ex-GST) entered by user
		const taxableAmount = Math.max(0, baseAmount - discountAmount); // Taxable = Base - Discount
		
		// Step 2: Calculate GST on taxable amount (Rule 3: GST on Base - Discount)
		let gstAmount: number | undefined;
		let finalPayable = taxableAmount;
		if (data.gstPercentage && data.gstPercentage > 0) {
			gstAmount = (taxableAmount * data.gstPercentage) / 100;
			finalPayable = taxableAmount + gstAmount; // Final Payable = Taxable + GST
		}
		
		// Rule 4: Payment validation (if not supporting partial payments)
		// For now, we allow partial payments, so we don't enforce exact match

		// Create payment record
		// Store final payable (taxable + GST) as the payment amount
		const payment = await prisma.payment.create({
			data: {
				memberId: data.memberId,
				amount: finalPayable, // Final Payable = Taxable + GST
				paymentMode: data.paymentMode,
				transactionId,
				notes: data.notes,
				invoiceNumber,
				gstNumber: data.gstNumber,
				gstPercentage: data.gstPercentage,
				gstAmount: gstAmount,
				discount: discountAmount > 0 ? discountAmount : null,
				nextDueAmount: data.nextDueAmount,
				nextDueDate: data.nextDueDate,
				createdBy: session.user.id,
				paymentDate: new Date(),
				// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma types are stale; nextDueAmount and nextDueDate fields exist in schema
			} as any,
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

		// Log activity (don't fail if logging fails)
		await createActivityLog({
			userId: session.user.id,
			action: "CREATE",
			entity: "Payment",
			entityId: payment.id,
			details: {
				amount: finalPayable,
				invoiceNumber,
				memberName: member.name,
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
