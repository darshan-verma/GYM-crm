"use server";

import prisma from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { LeadStatus, LeadSource } from "@prisma/client";
import { updateLeadNotification } from "./notifications";
import { createActivityLog } from "@/lib/utils/activityLog";
import { requireCurrentGymProfileId } from "./gym-profiles";

function isSuperAdmin(
	session: { user?: { role?: string } } | null | undefined
): boolean {
	return session?.user?.role === "SUPER_ADMIN";
}

export async function createLead(data: {
	name: string;
	phone: string;
	email?: string;
	source: LeadSource;
	interestedPlan?: string;
	notes?: string;
	followUpDate?: Date;
}) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");
	if (isSuperAdmin(session)) {
		return { success: false, error: "Unauthorized" as const };
	}
	const gymProfileId = await requireCurrentGymProfileId(session);

	try {
		const lead = await prisma.lead.create({
			data: {
				...data,
				gymProfileId,
				status: "NEW",
				assignedTo: session.user.id,
				lastContactDate: new Date(),
			},
		});

		await createActivityLog({
			userId: session.user.id,
			action: "CREATE",
			entity: "Lead",
			entityId: lead.id,
			details: { name: lead.name, source: lead.source },
		});

		revalidatePath("/leads");
		return { success: true, data: lead };
	} catch (_error) {
		return { success: false, error: "Failed to create lead" };
	}
}

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");
	if (isSuperAdmin(session)) {
		return { success: false, error: "Unauthorized" as const };
	}
	const gymProfileId = await requireCurrentGymProfileId(session);

	try {
		const updated = await prisma.lead.updateMany({
			where: { id: leadId, gymProfileId },
			data: {
				status,
				...(status === "CONVERTED" && { convertedDate: new Date() }),
				lastContactDate: new Date(),
			},
		});

		if (updated.count === 0) {
			return { success: false, error: "Lead not found" };
		}

		const lead = await prisma.lead.findFirst({
			where: { id: leadId, gymProfileId },
		});

		await createActivityLog({
			userId: session.user.id,
			action: "UPDATE",
			entity: "Lead",
			entityId: leadId,
			details: { status },
		});

		revalidatePath("/leads");
		return { success: true, data: lead };
	} catch (_error) {
		return { success: false, error: "Failed to update lead status" };
	}
}

export async function updateLead(
	leadId: string,
	data: Partial<{
		name: string;
		phone: string;
		email: string;
		notes: string;
		followUpDate: Date;
		interestedPlan: string;
	}>
) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");
	if (isSuperAdmin(session)) {
		return { success: false, error: "Unauthorized" as const };
	}
	const gymProfileId = await requireCurrentGymProfileId(session);

	try {
		const updated = await prisma.lead.updateMany({
			where: { id: leadId, gymProfileId },
			data: {
				...data,
				lastContactDate: new Date(),
			},
		});

		if (updated.count === 0) {
			return { success: false, error: "Lead not found" };
		}

		const lead = await prisma.lead.findFirst({
			where: { id: leadId, gymProfileId },
		});

		// Update notification if follow-up date changed
		if (data.followUpDate !== undefined) {
			try {
				await updateLeadNotification(leadId);
			} catch (notifError) {
				console.warn("Failed to update lead notification:", notifError);
				// Don't fail the update if notification update fails
			}
		}

		revalidatePath("/leads");
		return { success: true, data: lead };
	} catch (_error) {
		return { success: false, error: "Failed to update lead" };
	}
}

export async function getLeadsByStatus() {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");
	const gymProfileId = await requireCurrentGymProfileId(session);

	const leads = await prisma.lead.findMany({
		where: { gymProfileId },
		orderBy: { createdAt: "desc" },
		take: 100,
	});

	const grouped = {
		NEW: leads.filter((l) => l.status === "NEW"),
		CONTACTED: leads.filter((l) => l.status === "CONTACTED"),
		FOLLOW_UP: leads.filter((l) => l.status === "FOLLOW_UP"),
		CONVERTED: leads.filter((l) => l.status === "CONVERTED"),
		LOST: leads.filter((l) => l.status === "LOST"),
	};

	return grouped;
}

export async function getLeadsByStatusForGymPaginated(params: {
	gymProfileId: string;
	page: number;
	limit: number;
}): Promise<{
	leadsByStatus: Record<LeadStatus, Awaited<ReturnType<typeof prisma.lead.findMany>>>;
	statusCounts: Partial<Record<LeadStatus, number>>;
	total: number;
	pages: number;
	currentPage: number;
}> {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");
	if (!isSuperAdmin(session)) throw new Error("Unauthorized");

	const { gymProfileId, page, limit } = params;

	const [leads, total, counts] = await Promise.all([
		prisma.lead.findMany({
			where: { gymProfileId },
			orderBy: { createdAt: "desc" },
			skip: (page - 1) * limit,
			take: limit,
		}),
		prisma.lead.count({ where: { gymProfileId } }),
		prisma.lead.groupBy({
			by: ["status"],
			where: { gymProfileId },
			_count: true,
		}),
	]);

	const statusCounts: Partial<Record<LeadStatus, number>> = {};
	for (const row of counts) {
		statusCounts[row.status] = row._count;
	}

	const grouped: Record<LeadStatus, typeof leads> = {
		NEW: leads.filter((l) => l.status === "NEW"),
		CONTACTED: leads.filter((l) => l.status === "CONTACTED"),
		FOLLOW_UP: leads.filter((l) => l.status === "FOLLOW_UP"),
		CONVERTED: leads.filter((l) => l.status === "CONVERTED"),
		LOST: leads.filter((l) => l.status === "LOST"),
	};

	return {
		leadsByStatus: grouped,
		statusCounts,
		total,
		pages: Math.max(1, Math.ceil(total / limit)),
		currentPage: page,
	};
}

export async function getLeadById(id: string) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");
	const gymProfileId = await requireCurrentGymProfileId(session);

	const lead = await prisma.lead.findFirst({
		where: { id, gymProfileId },
	});

	if (!lead) return null;

	return {
		...lead,
		budget: lead.budget ? Number(lead.budget) : null,
	};
}

export async function getLeadStats() {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");
	const gymProfileId = await requireCurrentGymProfileId(session);

	const [total, statusCounts, sourceBreakdown, conversionRate] =
		await Promise.all([
			prisma.lead.count({ where: { gymProfileId } }),
			prisma.lead.groupBy({
				by: ["status"],
				where: { gymProfileId },
				_count: true,
			}),
			prisma.lead.groupBy({
				by: ["source"],
				where: { gymProfileId },
				_count: true,
			}),
			prisma.lead.aggregate({
				_count: {
					_all: true,
				},
				where: {
					status: "CONVERTED",
					gymProfileId,
				},
			}),
		]);

	return {
		total,
		converted: conversionRate._count._all,
		conversionRate:
			total > 0 ? ((conversionRate._count._all / total) * 100).toFixed(1) : "0",
		statusCounts,
		sourceBreakdown,
	};
}

export async function getLeadStatsForGymProfile(gymProfileId: string) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");
	if (!isSuperAdmin(session)) throw new Error("Unauthorized");

	const [total, statusCounts, sourceBreakdown, conversionRate] =
		await Promise.all([
			prisma.lead.count({ where: { gymProfileId } }),
			prisma.lead.groupBy({
				by: ["status"],
				where: { gymProfileId },
				_count: true,
			}),
			prisma.lead.groupBy({
				by: ["source"],
				where: { gymProfileId },
				_count: true,
			}),
			prisma.lead.aggregate({
				_count: {
					_all: true,
				},
				where: {
					status: "CONVERTED",
					gymProfileId,
				},
			}),
		]);

	return {
		total,
		converted: conversionRate._count._all,
		conversionRate:
			total > 0 ? ((conversionRate._count._all / total) * 100).toFixed(1) : "0",
		statusCounts,
		sourceBreakdown,
	};
}

export async function deleteLead(id: string) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");
	if (isSuperAdmin(session)) {
		return { success: false, error: "Unauthorized" as const };
	}
	const gymProfileId = await requireCurrentGymProfileId(session);

	try {
		const deleted = await prisma.lead.deleteMany({
			where: { id, gymProfileId },
		});
		if (deleted.count === 0) return { success: false, error: "Lead not found" };

		revalidatePath("/leads");
		return { success: true };
	} catch (_error) {
		return { success: false, error: "Failed to delete lead" };
	}
}

const VALID_SOURCES: LeadSource[] = [
	"WALK_IN",
	"PHONE_CALL",
	"WEBSITE",
	"SOCIAL_MEDIA",
	"REFERRAL",
	"OTHER",
];
const VALID_STATUSES: LeadStatus[] = [
	"NEW",
	"CONTACTED",
	"FOLLOW_UP",
	"CONVERTED",
	"LOST",
];

function parseExcelValue<T>(val: unknown, fallback: T): T {
	if (val === undefined || val === null || val === "") return fallback;
	return val as T;
}

function parseNumber(val: unknown): number | null {
	if (val === undefined || val === null || val === "") return null;
	if (typeof val === "number" && !Number.isNaN(val)) return val;
	const s = String(val).replace(/[₹,\s]/g, "").trim();
	const n = parseFloat(s);
	return Number.isNaN(n) ? null : n;
}

function parseDate(val: unknown): Date | null {
	if (val === undefined || val === null || val === "") return null;
	if (val instanceof Date && !Number.isNaN(val.getTime())) return val;
	const s = String(val).trim();
	if (s === "N/A" || !s) return null;
	const d = new Date(s);
	return Number.isNaN(d.getTime()) ? null : d;
}

export type ImportLeadsResult = {
	success: boolean;
	imported: number;
	skipped: number;
	errors: string[];
};

export async function importLeadsFromFile(
	formData: FormData
): Promise<ImportLeadsResult> {
	const session = await auth();
	if (!session) {
		return { success: false, imported: 0, skipped: 0, errors: ["Unauthorized"] };
	}
	if (isSuperAdmin(session)) {
		return { success: false, imported: 0, skipped: 0, errors: ["Unauthorized"] };
	}
	const gymProfileId = await requireCurrentGymProfileId(session);

	const file = formData.get("file") as File | null;
	if (!file || file.size === 0) {
		return {
			success: false,
			imported: 0,
			skipped: 0,
			errors: ["Please select an Excel file (.xlsx or .xls)"],
		};
	}

	const validTypes = [
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		"application/vnd.ms-excel",
	];
	if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
		return {
			success: false,
			imported: 0,
			skipped: 0,
			errors: ["Invalid file type. Please upload an Excel file (.xlsx or .xls)"],
		};
	}

	const XLSX = await import("xlsx");
	const buffer = Buffer.from(await file.arrayBuffer());
	const workbook = XLSX.read(buffer, { type: "buffer" });
	const sheetName = workbook.SheetNames[0] || "Leads";
	const worksheet = workbook.Sheets[sheetName];
	const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

	if (!rows.length) {
		return {
			success: false,
			imported: 0,
			skipped: 0,
			errors: ["The file has no data rows. Ensure the first sheet contains leads."],
		};
	}

	let imported = 0;
	let skipped = 0;
	const errors: string[] = [];

	for (let i = 0; i < rows.length; i++) {
		const row = rows[i];
		const rowNum = i + 2; // 1-based + header row

		const name = parseExcelValue(
			row["Name"] ?? row["name"],
			""
		) as string;
		const phone = parseExcelValue(
			row["Phone"] ?? row["phone"],
			""
		) as string;

		if (!name?.trim() || !phone?.trim()) {
			skipped++;
			errors.push(`Row ${rowNum}: Name and Phone are required. Skipped.`);
			continue;
		}

		const rawSource = String(row["Source"] ?? row["source"] ?? "WALK_IN").toUpperCase().replace(/\s/g, "_");
		const source: LeadSource = VALID_SOURCES.includes(rawSource as LeadSource)
			? (rawSource as LeadSource)
			: "WALK_IN";

		const rawStatus = String(row["Status"] ?? row["status"] ?? "NEW").toUpperCase().replace(/\s/g, "_");
		const status: LeadStatus = VALID_STATUSES.includes(rawStatus as LeadStatus)
			? (rawStatus as LeadStatus)
			: "NEW";

		const emailVal = row["Email"] ?? row["email"];
		const email =
			emailVal !== undefined && emailVal !== null && String(emailVal).trim() !== "" && String(emailVal) !== "N/A"
				? String(emailVal).trim()
				: null;

		const ageVal = row["Age"] ?? row["age"];
		let age: number | null = null;
		if (ageVal !== undefined && ageVal !== null && String(ageVal) !== "N/A") {
			const n = typeof ageVal === "number" ? ageVal : parseInt(String(ageVal), 10);
			if (!Number.isNaN(n)) age = n;
		}

		const genderVal = row["Gender"] ?? row["gender"];
		const gender =
			genderVal !== undefined && genderVal !== null && String(genderVal).trim() !== "" && String(genderVal) !== "N/A"
				? String(genderVal).trim()
				: null;

		const interestedPlanVal = row["Interested Plan"] ?? row["interestedPlan"];
		const interestedPlan =
			interestedPlanVal !== undefined &&
			interestedPlanVal !== null &&
			String(interestedPlanVal).trim() !== "" &&
			String(interestedPlanVal) !== "N/A"
				? String(interestedPlanVal).trim()
				: null;

		const budget = parseNumber(row["Budget"] ?? row["budget"]);

		const preferredTimeVal = row["Preferred Time"] ?? row["preferredTime"];
		const preferredTime =
			preferredTimeVal !== undefined &&
			preferredTimeVal !== null &&
			String(preferredTimeVal).trim() !== "" &&
			String(preferredTimeVal) !== "N/A"
				? String(preferredTimeVal).trim()
				: null;

		const notesVal = row["Notes"] ?? row["notes"];
		const notes =
			notesVal !== undefined && notesVal !== null && String(notesVal).trim() !== "" && String(notesVal) !== "N/A"
				? String(notesVal).trim()
				: null;

		const priorityVal = row["Priority"] ?? row["priority"];
		const priority =
			priorityVal !== undefined &&
			priorityVal !== null &&
			String(priorityVal).trim() !== "" &&
			String(priorityVal) !== "N/A"
				? String(priorityVal).trim()
				: null;

		const followUpDate = parseDate(row["Follow-up Date"] ?? row["followUpDate"]);
		const lastContactDate = parseDate(row["Last Contact Date"] ?? row["lastContactDate"]);
		const convertedDate = parseDate(row["Converted Date"] ?? row["convertedDate"]);

		try {
			await prisma.lead.create({
				data: {
					name: name.trim(),
					phone: phone.trim(),
					email,
					age,
					gender,
					source,
					status,
					interestedPlan,
					budget: budget !== null ? budget : undefined,
					preferredTime,
					notes,
					priority,
					followUpDate: followUpDate ?? undefined,
					lastContactDate: lastContactDate ?? new Date(),
					convertedDate: convertedDate ?? undefined,
					assignedTo: session.user.id,
					gymProfileId,
				},
			});
			imported++;
		} catch (err) {
			errors.push(
				`Row ${rowNum}: Failed to create lead "${name}" - ${err instanceof Error ? err.message : "Unknown error"}`
			);
		}
	}

	if (imported > 0) {
		await createActivityLog({
			userId: session.user.id,
			action: "BULK_IMPORT",
			entity: "Lead",
			entityId: null,
			details: {
				imported,
				skipped,
				fileName: file.name,
				totalRows: rows.length,
			},
		});
	}

	revalidatePath("/leads");

	return {
		success: imported > 0,
		imported,
		skipped,
		errors,
	};
}
