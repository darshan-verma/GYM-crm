"use server";

import prisma from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { LeadStatus, LeadSource } from "@prisma/client";

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

	try {
		const lead = await prisma.lead.create({
			data: {
				...data,
				status: "NEW",
				assignedTo: session.user.id,
				lastContactDate: new Date(),
			},
		});

		await prisma.activityLog.create({
			data: {
				userId: session.user.id,
				action: "CREATE",
				entity: "Lead",
				entityId: lead.id,
				details: { name: lead.name, source: lead.source },
			},
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

	try {
		const lead = await prisma.lead.update({
			where: { id: leadId },
			data: {
				status,
				...(status === "CONVERTED" && { convertedDate: new Date() }),
				lastContactDate: new Date(),
			},
		});

		await prisma.activityLog.create({
			data: {
				userId: session.user.id,
				action: "UPDATE",
				entity: "Lead",
				entityId: leadId,
				details: { status },
			},
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

	try {
		const lead = await prisma.lead.update({
			where: { id: leadId },
			data: {
				...data,
				lastContactDate: new Date(),
			},
		});

		revalidatePath("/leads");
		return { success: true, data: lead };
	} catch (_error) {
		return { success: false, error: "Failed to update lead" };
	}
}

export async function getLeadsByStatus() {
	const leads = await prisma.lead.findMany({
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

export async function getLeadById(id: string) {
	return await prisma.lead.findUnique({
		where: { id },
	});
}

export async function getLeadStats() {
	const [total, statusCounts, sourceBreakdown, conversionRate] =
		await Promise.all([
			prisma.lead.count(),
			prisma.lead.groupBy({
				by: ["status"],
				_count: true,
			}),
			prisma.lead.groupBy({
				by: ["source"],
				_count: true,
			}),
			prisma.lead.aggregate({
				_count: {
					_all: true,
				},
				where: {
					status: "CONVERTED",
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

	try {
		await prisma.lead.delete({
			where: { id },
		});

		revalidatePath("/leads");
		return { success: true };
	} catch (_error) {
		return { success: false, error: "Failed to delete lead" };
	}
}
