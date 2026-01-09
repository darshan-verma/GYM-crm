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
		const status = searchParams.get("status");
		const source = searchParams.get("source");

		// Build where clause
		const where: Record<string, unknown> = {};
		if (status && status !== "ALL") {
			where.status = status;
		}
		if (source && source !== "ALL") {
			where.source = source;
		}

		// Fetch leads
		const leads = await prisma.lead.findMany({
			where,
			orderBy: {
				createdAt: "desc",
			},
		});

		// Prepare data for Excel
		const data = leads.map((lead) => ({
			Name: lead.name,
			Phone: lead.phone,
			Email: lead.email || "N/A",
			Age: lead.age || "N/A",
			Gender: lead.gender || "N/A",
			Source: lead.source,
			Status: lead.status,
			"Interested Plan": lead.interestedPlan || "N/A",
			Budget: lead.budget ? `₹${Number(lead.budget).toFixed(2)}` : "N/A",
			"Preferred Time": lead.preferredTime || "N/A",
			"Follow-up Date": lead.followUpDate
				? new Date(lead.followUpDate).toLocaleDateString("en-IN")
				: "N/A",
			"Last Contact Date": lead.lastContactDate
				? new Date(lead.lastContactDate).toLocaleDateString("en-IN")
				: "N/A",
			"Converted Date": lead.convertedDate
				? new Date(lead.convertedDate).toLocaleDateString("en-IN")
				: "N/A",
			Priority: lead.priority || "N/A",
			Notes: lead.notes || "N/A",
			"Created Date": new Date(lead.createdAt).toLocaleDateString("en-IN"),
		}));

		// Create worksheet
		const worksheet = XLSX.utils.json_to_sheet(data);

		// Set column widths
		worksheet["!cols"] = [
			{ wch: 25 }, // Name
			{ wch: 15 }, // Phone
			{ wch: 30 }, // Email
			{ wch: 8 }, // Age
			{ wch: 10 }, // Gender
			{ wch: 15 }, // Source
			{ wch: 12 }, // Status
			{ wch: 20 }, // Interested Plan
			{ wch: 12 }, // Budget
			{ wch: 15 }, // Preferred Time
			{ wch: 15 }, // Follow-up Date
			{ wch: 18 }, // Last Contact Date
			{ wch: 15 }, // Converted Date
			{ wch: 10 }, // Priority
			{ wch: 30 }, // Notes
			{ wch: 15 }, // Created Date
		];

		// Create workbook
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");

		// Add summary sheet
		const summaryData = [
			{ Metric: "Total Leads", Value: leads.length },
			{ Metric: "Export Date", Value: new Date().toLocaleDateString("en-IN") },
			{ Metric: "Exported By", Value: session.user?.name || "Unknown" },
		];

		const summarySheet = XLSX.utils.json_to_sheet(summaryData);
		summarySheet["!cols"] = [{ wch: 20 }, { wch: 30 }];
		XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

		// Generate buffer
		const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

		// Generate filename with timestamp
		const timestamp = new Date().toISOString().split("T")[0];
		const filename = `Leads_Export_${timestamp}.xlsx`;

		// Return file
		return new NextResponse(buffer, {
			headers: {
				"Content-Type":
					"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				"Content-Disposition": `attachment; filename="${filename}"`,
			},
		});
	} catch (error) {
		console.error("Export leads error:", error);
		return NextResponse.json(
			{ error: "Failed to export leads" },
			{ status: 500 }
		);
	}
}
