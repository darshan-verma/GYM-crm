import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db/prisma";
import { generateInvoicePDFBlob } from "@/lib/utils/pdf";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await auth();
		if (!session) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		const { id } = await params;

		const payment = await prisma.payment.findUnique({
			where: { id },
			include: {
				member: true,
			},
		});

		if (!payment) {
			return new NextResponse("Payment not found", { status: 404 });
		}

		// Get membership details if available
		const membership = await prisma.membership.findFirst({
			where: {
				memberId: payment.memberId,
				active: true,
			},
			include: {
				plan: true,
			},
		});

		// Generate PDF
		const pdfBlob = generateInvoicePDFBlob({
			invoiceNumber: payment.invoiceNumber,
			paymentDate: payment.paymentDate,
			memberName: payment.member.name,
			memberEmail: payment.member.email || undefined,
			memberPhone: payment.member.phone,
			amount: parseFloat(payment.amount.toString()), // Total payment including GST
			paymentMode: payment.paymentMode,
			transactionId: payment.transactionId || undefined,
			planName: membership?.plan.name,
			planDuration: membership ? `${membership.plan.duration} days` : undefined,
			startDate: membership?.startDate,
			endDate: membership?.endDate,
			discount: payment.discount
				? parseFloat(payment.discount.toString())
				: undefined,
			membershipBaseAmount: membership
				? parseFloat(membership.finalAmount.toString())
				: undefined,
			notes: payment.notes || undefined,
			gstNumber: payment.gstNumber || undefined,
			gstPercentage: payment.gstPercentage
				? parseFloat(payment.gstPercentage.toString())
				: undefined,
			gstAmount: payment.gstAmount
				? parseFloat(payment.gstAmount.toString())
				: undefined,
			nextDueAmount: (payment as unknown as { nextDueAmount?: unknown }).nextDueAmount
				? parseFloat(String((payment as unknown as { nextDueAmount?: unknown }).nextDueAmount))
				: undefined,
			nextDueDate: (payment as unknown as { nextDueDate?: unknown }).nextDueDate as Date || undefined,
		});

		// Convert blob to buffer
		const buffer = Buffer.from(await pdfBlob.arrayBuffer());

		// Return PDF as download
		return new NextResponse(buffer, {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename="Invoice_${payment.invoiceNumber}.pdf"`,
			},
		});
	} catch (error) {
		console.error("Download invoice error:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
