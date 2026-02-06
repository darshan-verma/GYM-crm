import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db/prisma";
import { generateInvoicePDFBlob } from "@/lib/utils/pdf";
import { getActiveGymProfile } from "@/lib/actions/gym-profiles";
import { getLogoAsDataUrl, getWatermarkAsDataUrlForPdf } from "@/lib/utils/logo";

/** Resolve relative URLs to absolute using request origin so fetch() works in API routes (e.g. serverless). */
function resolveAssetUrl(url: string | undefined, request: Request): string | undefined {
	if (!url) return undefined;
	if (url.startsWith("http://") || url.startsWith("https://")) return url;
	if (url.startsWith("/")) {
		try {
			return new URL(url, request.url).toString();
		} catch {
			return url;
		}
	}
	return url;
}

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

		const gymProfile = await getActiveGymProfile();
		const rawLogoUrl = gymProfile && "logoUrl" in gymProfile ? (gymProfile as { logoUrl?: string | null }).logoUrl : undefined;
		const rawWatermarkUrl = gymProfile && "watermarkUrl" in gymProfile ? (gymProfile as { watermarkUrl?: string | null }).watermarkUrl : undefined;
		// Resolve to absolute URLs so fetch works when file is not on disk (e.g. serverless or Blob)
		const logoUrl = resolveAssetUrl(rawLogoUrl ?? undefined, request);
		const watermarkUrl = resolveAssetUrl(rawWatermarkUrl ?? undefined, request);
		const logoBase64 = logoUrl ? await getLogoAsDataUrl(logoUrl) : null;
		const watermarkBase64 = watermarkUrl ? await getWatermarkAsDataUrlForPdf(watermarkUrl) : null;

		// Generate PDF
		const pdfBlob = generateInvoicePDFBlob({
			gymProfile: gymProfile
				? {
						name: gymProfile.name,
						description: gymProfile.description,
						address: gymProfile.address,
						phone: gymProfile.phone,
						email: gymProfile.email,
						logoBase64: logoBase64 ?? undefined,
						watermarkBase64: watermarkBase64 ?? undefined,
					}
				: undefined,
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
