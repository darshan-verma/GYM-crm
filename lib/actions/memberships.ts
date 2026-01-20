"use server";

import prisma from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { updateMembershipNotifications } from "./notifications";
import { createActivityLog } from "@/lib/utils/activityLog";

export async function getMembershipPlans() {
	const plans = await prisma.membershipPlan.findMany({
		where: { active: true },
		orderBy: { sortOrder: "asc" },
	});

	return plans.map((plan) => ({
		...plan,
		price: Number(plan.price),
	}));
}

export async function getMembershipPlan(id: string) {
	return await prisma.membershipPlan.findUnique({
		where: { id },
	});
}

export async function createMembershipPlan(data: {
	name: string;
	description?: string;
	duration: number;
	price: number;
	features?: string[];
	color?: string;
	popular?: boolean;
}) {
	const session = await auth();
	if (!session || session.user.role !== "ADMIN") {
		throw new Error("Unauthorized");
	}

	try {
		const _plan = await prisma.membershipPlan.create({
			data: {
				...data,
				features: data.features || [],
			},
		});

		revalidatePath("/memberships");
		return { success: true };
	} catch (_error) {
		return { success: false, error: "Failed to create membership plan" };
	}
}

export async function updateMembershipPlan(
	id: string,
	data: {
		name: string;
		description?: string;
		duration: number;
		price: number;
		features?: string[];
		color?: string;
		popular?: boolean;
		active?: boolean;
	}
) {
	const session = await auth();
	if (!session || session.user.role !== "ADMIN") {
		throw new Error("Unauthorized");
	}

	try {
		const _plan = await prisma.membershipPlan.update({
			where: { id },
			data: {
				...data,
				features: data.features || [],
			},
		});

		revalidatePath("/memberships");
		revalidatePath(`/memberships/${id}/edit`);
		return { success: true };
	} catch (_error) {
		return { success: false, error: "Failed to update membership plan" };
	}
}

export async function deleteMembershipPlan(id: string) {
	const session = await auth();
	if (!session || session.user.role !== "ADMIN") {
		throw new Error("Unauthorized");
	}

	try {
		// Check if plan has active memberships
		const activeMemberships = await prisma.membership.count({
			where: { planId: id, active: true },
		});

		if (activeMemberships > 0) {
			return {
				success: false,
				error: `Cannot delete plan with ${activeMemberships} active memberships. Deactivate it instead.`,
			};
		}

		// Soft delete by setting active to false
		await prisma.membershipPlan.update({
			where: { id },
			data: { active: false },
		});

		revalidatePath("/memberships");
		return { success: true };
	} catch (_error) {
		return { success: false, error: "Failed to delete membership plan" };
	}
}

export async function assignMembership(data: {
	memberId: string;
	planId: string;
	startDate: Date;
	discount?: number;
	discountType?: "PERCENTAGE" | "FIXED";
	notes?: string;
}) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");

	try {
		const plan = await prisma.membershipPlan.findUnique({
			where: { id: data.planId },
		});

		if (!plan) {
			return { success: false, error: "Plan not found" };
		}

		// Calculate end date
		const endDate = new Date(data.startDate);
		endDate.setDate(endDate.getDate() + plan.duration);

		// Calculate final amount
		let finalAmount = Number(plan.price);
		if (data.discount) {
			if (data.discountType === "PERCENTAGE") {
				finalAmount = finalAmount - (finalAmount * data.discount) / 100;
			} else {
				finalAmount = finalAmount - data.discount;
			}
		}

		// Deactivate existing memberships
		await prisma.membership.updateMany({
			where: { memberId: data.memberId, active: true },
			data: { active: false },
		});

		// Create new membership
		const membership = await prisma.membership.create({
			data: {
				memberId: data.memberId,
				planId: data.planId,
				startDate: data.startDate,
				endDate,
				amount: plan.price,
				discount: data.discount,
				discountType: data.discountType,
				finalAmount,
				active: true,
				notes: data.notes,
			},
			include: {
				plan: true,
				member: true,
			},
		});

		// Update member status to ACTIVE
		await prisma.member.update({
			where: { id: data.memberId },
			data: { status: "ACTIVE" },
		});

		// Log activity
		await createActivityLog({
			userId: session.user.id,
			action: "CREATE",
			entity: "Membership",
			entityId: membership.id,
			details: {
				memberName: membership.member.name,
				planName: membership.plan.name,
			},
		});

		// Update notifications for new membership
		try {
			await updateMembershipNotifications(membership.id);
		} catch (notifError) {
			console.warn("Failed to update membership notifications:", notifError);
			// Don't fail the creation if notification update fails
		}

		revalidatePath(`/members/${data.memberId}`);
		revalidatePath("/members");
		return { success: true, data: membership };
	} catch (error) {
		console.error("Assign membership error:", error);
		return { success: false, error: "Failed to assign membership" };
	}
}

export async function updateMembership(
	membershipId: string,
	data: {
		planId: string;
		startDate: Date;
		discount?: number;
		discountType?: "PERCENTAGE" | "FIXED";
		notes?: string;
	}
) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");

	try {
		const currentMembership = await prisma.membership.findUnique({
			where: { id: membershipId },
			include: { member: true },
		});

		if (!currentMembership) {
			return { success: false, error: "Membership not found" };
		}

		const plan = await prisma.membershipPlan.findUnique({
			where: { id: data.planId },
		});

		if (!plan) {
			return { success: false, error: "Plan not found" };
		}

		// Calculate end date based on new plan duration
		const endDate = new Date(data.startDate);
		endDate.setDate(endDate.getDate() + plan.duration);

		// Calculate final amount
		let finalAmount = Number(plan.price);
		if (data.discount) {
			if (data.discountType === "PERCENTAGE") {
				finalAmount = finalAmount - (finalAmount * data.discount) / 100;
			} else {
				finalAmount = finalAmount - data.discount;
			}
		}

		// Update the membership
		const updatedMembership = await prisma.membership.update({
			where: { id: membershipId },
			data: {
				planId: data.planId,
				startDate: data.startDate,
				endDate,
				amount: plan.price,
				discount: data.discount,
				discountType: data.discountType,
				finalAmount,
				notes: data.notes,
			},
			include: {
				plan: true,
				member: true,
			},
		});

		// Log activity
		await createActivityLog({
			userId: session.user.id,
			action: "UPDATE",
			entity: "Membership",
			entityId: updatedMembership.id,
			details: {
				memberName: updatedMembership.member.name,
				planName: updatedMembership.plan.name,
			},
		});

		// Update notifications since end date may have changed
		try {
			await updateMembershipNotifications(membershipId);
		} catch (notifError) {
			console.warn("Failed to update membership notifications:", notifError);
			// Don't fail the update if notification update fails
		}

		revalidatePath(`/members/${currentMembership.memberId}`);
		revalidatePath("/members");
		return { success: true, data: updatedMembership };
	} catch (error) {
		console.error("Update membership error:", error);
		return { success: false, error: "Failed to update membership" };
	}
}

export async function renewMembership(membershipId: string) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");

	try {
		const currentMembership = await prisma.membership.findUnique({
			where: { id: membershipId },
			include: { plan: true, member: true },
		});

		if (!currentMembership) {
			return { success: false, error: "Membership not found" };
		}

		const startDate = new Date();
		const endDate = new Date(startDate);
		endDate.setDate(endDate.getDate() + currentMembership.plan.duration);

		// Deactivate current membership
		await prisma.membership.update({
			where: { id: membershipId },
			data: { active: false },
		});

		// Create renewed membership
		const newMembership = await prisma.membership.create({
			data: {
				memberId: currentMembership.memberId,
				planId: currentMembership.planId,
				startDate,
				endDate,
				amount: currentMembership.plan.price,
				finalAmount: currentMembership.plan.price,
				active: true,
			},
		});

		// Update member status
		await prisma.member.update({
			where: { id: currentMembership.memberId },
			data: { status: "ACTIVE" },
		});

		await createActivityLog({
			userId: session.user.id,
			action: "RENEW",
			entity: "Membership",
			entityId: newMembership.id,
			details: {
				memberName: currentMembership.member.name,
				planName: currentMembership.plan.name,
			},
		});

		revalidatePath(`/members/${currentMembership.memberId}`);
		return { success: true, data: newMembership };
	} catch (_error) {
		return { success: false, error: "Failed to renew membership" };
	}
}
