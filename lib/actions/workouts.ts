"use server";

import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { createActivityLog } from "@/lib/utils/activityLog";
import { requireCurrentGymProfileId } from "./gym-profiles";
import type { Session } from "next-auth";

interface Exercise {
	name: string;
	sets: number;
	reps: number;
	weight: number;
	restTime: number;
	notes: string;
}

function assertSuperAdmin(session: Session | null) {
	if (!session) throw new Error("Unauthorized");
	if (session.user.role !== "SUPER_ADMIN") throw new Error("Forbidden");
}

export async function getWorkoutPlans(memberId?: string) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");
	const gymProfileId = await requireCurrentGymProfileId(session);

	const where: Record<string, unknown> = {};

	if (memberId) {
		where.memberId = memberId;
	}
	where.gymProfileId = gymProfileId;

	return await prisma.workoutPlan.findMany({
		where,
		include: {
			member: {
				select: {
					id: true,
					name: true,
					membershipNumber: true,
				},
			},
			goal: {
				select: {
					id: true,
					name: true,
				},
			},
		},
		orderBy: { createdAt: "desc" },
	});
}

export async function getWorkoutPlansForGymProfile(params: {
	gymProfileId: string;
	memberId?: string;
}) {
	const session = await auth();
	assertSuperAdmin(session);

	const where: Record<string, unknown> = {
		gymProfileId: params.gymProfileId,
	};

	if (params.memberId) {
		where.memberId = params.memberId;
	}

	return await prisma.workoutPlan.findMany({
		where,
		include: {
			member: {
				select: {
					id: true,
					name: true,
					membershipNumber: true,
				},
			},
			goal: {
				select: {
					id: true,
					name: true,
				},
			},
		},
		orderBy: { createdAt: "desc" },
	});
}

export async function getWorkoutPlan(id: string) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");
	const gymProfileId = await requireCurrentGymProfileId(session);

	return await prisma.workoutPlan.findFirst({
		where: { id, gymProfileId },
		include: {
			member: {
				select: {
					id: true,
					name: true,
					membershipNumber: true,
					email: true,
					phone: true,
				},
			},
			goal: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	});
}

export async function createWorkoutPlan(data: {
	memberId: string;
	name: string;
	description?: string;
	exercises: Exercise[];
	difficulty?: string;
	goalId?: string;
	startDate?: Date;
	endDate?: Date;
}) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");
	const gymProfileId = await requireCurrentGymProfileId(session);

	try {
		const member = await prisma.member.findUnique({
			where: { id: data.memberId, gymProfileId },
			select: { id: true },
		});
		if (!member) return { success: false, error: "Member not found" };

		const workoutPlan = await prisma.workoutPlan.create({
			data: {
				...data,
				gymProfileId,
				exercises: data.exercises as unknown as Prisma.InputJsonValue,
			},
		});

		// Log activity (don't fail if logging fails)
		await createActivityLog({
			userId: session.user.id,
			action: "CREATE",
			entity: "WorkoutPlan",
			entityId: workoutPlan.id,
			details: {
				name: workoutPlan.name,
				memberId: data.memberId,
			},
		});

		revalidatePath("/workouts");
		revalidatePath(`/members/${data.memberId}`);
		return { success: true };
	} catch (error) {
		console.error("Create workout plan error:", error);
		return { success: false, error: "Failed to create workout plan" };
	}
}

export async function updateWorkoutPlan(
	id: string,
	data: {
		name: string;
		description?: string;
		exercises: Exercise[];
		difficulty?: string;
		goal?: string;
		startDate?: Date;
		endDate?: Date;
		active?: boolean;
	}
) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");
	const gymProfileId = await requireCurrentGymProfileId(session);

	try {
		const existing = await prisma.workoutPlan.findFirst({
			where: { id, gymProfileId },
			select: { id: true },
		});
		if (!existing) return { success: false, error: "Workout plan not found" };

		const updateData: Record<string, unknown> = {
			name: data.name,
			description: data.description,
			exercises: data.exercises as unknown as Prisma.InputJsonValue,
			difficulty: data.difficulty,
			startDate: data.startDate,
			endDate: data.endDate,
			active: data.active,
		};

		// Handle goal relation separately
		if (data.goal) {
			updateData.goal = {
				connect: { id: data.goal },
			};
		}

		const plan = await prisma.workoutPlan.update({
			where: { id },
			data: updateData,
		});

		// Log activity (don't fail if logging fails)
		await createActivityLog({
			userId: session.user.id,
			action: "UPDATE",
			entity: "WorkoutPlan",
			entityId: plan.id,
			details: {
				name: plan.name,
				memberId: plan.memberId,
			},
		});

		revalidatePath("/workouts");
		revalidatePath(`/workouts/${id}`);
		revalidatePath(`/members/${plan.memberId}`);
		return { success: true };
	} catch (_error) {
		return { success: false, error: "Failed to update workout plan" };
	}
}

export async function deleteWorkoutPlan(id: string) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");
	const gymProfileId = await requireCurrentGymProfileId(session);

	try {
		const existing = await prisma.workoutPlan.findFirst({
			where: { id, gymProfileId },
			select: { id: true },
		});
		if (!existing) return { success: false, error: "Workout plan not found" };

		const plan = await prisma.workoutPlan.delete({
			where: { id },
		});

		// Log activity (don't fail if logging fails)
		await createActivityLog({
			userId: session.user.id,
			action: "DELETE",
			entity: "WorkoutPlan",
			entityId: plan.id,
			details: {
				name: plan.name,
				memberId: plan.memberId,
			},
		});

		revalidatePath("/workouts");
		revalidatePath(`/members/${plan.memberId}`);
		return { success: true };
	} catch (_error) {
		return { success: false, error: "Failed to delete workout plan" };
	}
}
