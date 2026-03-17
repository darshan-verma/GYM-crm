"use server";

import prisma from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { hash } from "bcryptjs";
import { requireCurrentGymProfileId } from "./gym-profiles";
import { createActivityLog } from "@/lib/utils/activityLog";
import type { Session } from "next-auth";

function assertSuperAdmin(session: Session | null) {
	if (!session) throw new Error("Unauthorized");
	if (session.user.role !== "SUPER_ADMIN") throw new Error("Forbidden");
}

export async function getTrainers() {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");
	const gymProfileId = await requireCurrentGymProfileId(session);

	return await prisma.user.findMany({
		where: {
			role: "TRAINER",
			active: true,
			gymProfileId,
		},
		select: {
			id: true,
			name: true,
			email: true,
			phone: true,
			avatar: true,
			createdAt: true,
			_count: {
				select: {
					trainedMembers: true,
				},
			},
		},
		orderBy: { name: "asc" },
	});
}

export async function getTrainersForGymProfile(gymProfileId: string) {
	const session = await auth();
	assertSuperAdmin(session);

	return await prisma.user.findMany({
		where: {
			role: "TRAINER",
			active: true,
			gymProfileId,
		},
		select: {
			id: true,
			name: true,
			email: true,
			phone: true,
			avatar: true,
			createdAt: true,
			_count: {
				select: {
					trainedMembers: true,
				},
			},
		},
		orderBy: { name: "asc" },
	});
}

export async function getTrainerById(id: string) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");
	const gymProfileId = await requireCurrentGymProfileId(session);

	return await prisma.user.findFirst({
		where: { id, role: "TRAINER", gymProfileId },
		include: {
			trainedMembers: {
				where: { gymProfileId },
				include: {
					memberships: {
						where: { active: true },
						include: { plan: true },
						take: 1,
					},
				},
				orderBy: { name: "asc" },
			},
			_count: {
				select: {
					trainedMembers: true,
					activityLogs: true,
				},
			},
		},
	});
}

export async function createTrainer(data: {
	name: string;
	email: string;
	password: string;
	phone?: string;
}) {
	const session = await auth();
	if (!session || session.user.role !== "ADMIN") {
		throw new Error("Unauthorized");
	}
	const gymProfileId = await requireCurrentGymProfileId(session);

	try {
		// Check if email already exists
		const existing = await prisma.user.findUnique({
			where: { email: data.email },
		});

		if (existing) {
			return { success: false, error: "Email already exists" };
		}

		const hashedPassword = await hash(data.password, 10);

		const trainer = await prisma.user.create({
			data: {
				...data,
				password: hashedPassword,
				role: "TRAINER",
				gymProfileId,
			},
		});

		await createActivityLog({
			userId: session.user.id,
			action: "CREATE",
			entity: "Trainer",
			entityId: trainer.id,
			details: { name: trainer.name },
		});

		revalidatePath("/trainers");
		return { success: true, data: trainer };
	} catch (_error) {
		return { success: false, error: "Failed to create trainer" };
	}
}

export async function updateTrainer(
	id: string,
	data: {
		name?: string;
		email?: string;
		phone?: string;
		active?: boolean;
	}
) {
	const session = await auth();
	if (!session || session.user.role !== "ADMIN") {
		throw new Error("Unauthorized");
	}
	const gymProfileId = await requireCurrentGymProfileId(session);

	try {
		const existing = await prisma.user.findFirst({
			where: { id, role: "TRAINER", gymProfileId },
			select: { id: true },
		});
		if (!existing) return { success: false, error: "Trainer not found" };

		const trainer = await prisma.user.update({
			where: { id },
			data,
		});

		await createActivityLog({
			userId: session.user.id,
			action: "UPDATE",
			entity: "Trainer",
			entityId: id,
			details: { name: trainer.name },
		});

		revalidatePath("/trainers");
		revalidatePath(`/trainers/${id}`);
		return { success: true, data: trainer };
	} catch (_error) {
		return { success: false, error: "Failed to update trainer" };
	}
}

export async function deleteTrainer(id: string) {
	const session = await auth();
	if (!session || session.user.role !== "ADMIN") {
		throw new Error("Unauthorized");
	}
	const gymProfileId = await requireCurrentGymProfileId(session);

	try {
		const existing = await prisma.user.findFirst({
			where: { id, role: "TRAINER", gymProfileId },
			select: { id: true },
		});
		if (!existing) return { success: false, error: "Trainer not found" };

		// Soft delete by deactivating
		const trainer = await prisma.user.update({
			where: { id },
			data: { active: false },
		});

		await createActivityLog({
			userId: session.user.id,
			action: "DELETE",
			entity: "Trainer",
			entityId: id,
			details: { name: trainer.name },
		});

		revalidatePath("/trainers");
		return { success: true };
	} catch (_error) {
		return { success: false, error: "Failed to delete trainer" };
	}
}
