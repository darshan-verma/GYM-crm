import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db/prisma";
import * as XLSX from "xlsx";

export async function GET(request: NextRequest) {
	try {
		const session = await auth();

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get query parameters for filtering
		const searchParams = request.nextUrl.searchParams;
		const startDate = searchParams.get("startDate");
		const endDate = searchParams.get("endDate");
		const paymentMode = searchParams.get("paymentMode");

		// Build where clause
		const where: Record<string, unknown> = {};

		if (startDate && endDate) {
			where.paymentDate = {
				gte: new Date(startDate),
				lte: new Date(endDate),
			};
		}

		if (paymentMode && paymentMode !== "ALL") {
			where.paymentMode = paymentMode;
		}

		// Fetch payments
		const payments = await prisma.payment.findMany({
			where,
			include: {
				member: {
					select: {
						name: true,
						membershipNumber: true,
						email: true,
						phone: true,
					},
				},
			},
			orderBy: {
				paymentDate: "desc",
			},
		});

		// Prepare data for Excel
		const data = payments.map((payment) => ({
			"Invoice No.": payment.invoiceNumber,
			"Member Name": payment.member.name,
			"Membership No.": payment.member.membershipNumber,
			Email: payment.member.email || "N/A",
			Phone: payment.member.phone,
			"Amount (₹)": Number(payment.amount),
			"Payment Mode": payment.paymentMode,
			"Payment Date": new Date(payment.paymentDate).toLocaleDateString("en-IN"),
			"Transaction ID": payment.transactionId || "N/A",
			"Reference No.": payment.referenceNumber || "N/A",
			Notes: payment.notes || "N/A",
		}));

		// Create worksheet
		const worksheet = XLSX.utils.json_to_sheet(data);

		// Set column widths
		worksheet["!cols"] = [
			{ wch: 15 }, // Invoice No.
			{ wch: 25 }, // Member Name
			{ wch: 15 }, // Membership No.
			{ wch: 30 }, // Email
			{ wch: 15 }, // Phone
			{ wch: 12 }, // Amount
			{ wch: 15 }, // Payment Mode
			{ wch: 15 }, // Payment Date
			{ wch: 20 }, // Transaction ID
			{ wch: 20 }, // Reference No.
			{ wch: 30 }, // Notes
		];

		// Create workbook
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");

		// Calculate totals
		const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);

		// Group by payment mode
		const paymentModeBreakdown = payments.reduce(
			(acc: Record<string, { count: number; amount: number }>, payment) => {
				const mode = payment.paymentMode;
				if (!acc[mode]) {
					acc[mode] = { count: 0, amount: 0 };
				}
				acc[mode].count++;
				acc[mode].amount += Number(payment.amount);
				return acc;
			},
			{}
		);

		// Add summary sheet
		const summaryData = [
			{ Metric: "Total Payments", Value: payments.length.toString() },
			{ Metric: "Total Amount (₹)", Value: totalAmount.toFixed(2) },
			{
				Metric: "Average Payment (₹)",
				Value:
					payments.length > 0
						? (totalAmount / payments.length).toFixed(2)
						: "0",
			},
			{ Metric: "Export Date", Value: new Date().toLocaleDateString("en-IN") },
			{ Metric: "Exported By", Value: session.user?.name || "Unknown" },
			{ Metric: "", Value: "" }, // Empty row
			{ Metric: "Payment Mode Breakdown", Value: "" },
		];

		// Add payment mode breakdown to summary
		Object.entries(paymentModeBreakdown).forEach(
			([mode, data]: [string, { count: number; amount: number }]) => {
				summaryData.push({
					Metric: `${mode} - Count`,
					Value: data.count.toString(),
				});
				summaryData.push({
					Metric: `${mode} - Amount (₹)`,
					Value: data.amount.toFixed(2),
				});
			}
		);

		const summarySheet = XLSX.utils.json_to_sheet(summaryData);
		summarySheet["!cols"] = [{ wch: 30 }, { wch: 20 }];
		XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

		// Generate buffer
		const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

		// Generate filename with timestamp
		const timestamp = new Date().toISOString().split("T")[0];
		const filename = `Payments_Export_${timestamp}.xlsx`;

		// Return file
		return new NextResponse(buffer, {
			headers: {
				"Content-Type":
					"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				"Content-Disposition": `attachment; filename="${filename}"`,
			},
		});
	} catch (error) {
		console.error("Export payments error:", error);
		return NextResponse.json(
			{ error: "Failed to export payments" },
			{ status: 500 }
		);
	}
}
