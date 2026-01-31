"use server";

import prisma from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

const ACTIVE_GYM_PROFILE_KEY = "activeGymProfileId";

export type GymProfileFormData = {
	name: string;
	description?: string;
	address?: string;
	phone?: string;
	email?: string;
};

export async function getGymProfiles() {
	const profiles = await prisma.gymProfile.findMany({
		orderBy: { name: "asc" },
	});
	return profiles;
}

export async function getActiveGymProfile() {
	const setting = await prisma.systemSettings.findUnique({
		where: { key: ACTIVE_GYM_PROFILE_KEY },
	});
	if (!setting || typeof setting.value !== "string") {
		return null;
	}
	const profile = await prisma.gymProfile.findUnique({
		where: { id: setting.value },
	});
	return profile;
}

export async function getActiveGymProfileId(): Promise<string | null> {
	const setting = await prisma.systemSettings.findUnique({
		where: { key: ACTIVE_GYM_PROFILE_KEY },
	});
	if (!setting || typeof setting.value !== "string") return null;
	return setting.value;
}

export async function createGymProfile(data: GymProfileFormData) {
	const profile = await prisma.gymProfile.create({
		data: {
			name: data.name.trim(),
			description: data.description?.trim() || null,
			address: data.address?.trim() || null,
			phone: data.phone?.trim() || null,
			email: data.email?.trim() || null,
		},
	});
	revalidatePath("/settings");
	return { success: true, profile };
}

export async function updateGymProfile(id: string, data: GymProfileFormData) {
	await prisma.gymProfile.update({
		where: { id },
		data: {
			name: data.name.trim(),
			description: data.description?.trim() || null,
			address: data.address?.trim() || null,
			phone: data.phone?.trim() || null,
			email: data.email?.trim() || null,
		},
	});
	revalidatePath("/settings");
	return { success: true };
}

export async function deleteGymProfile(id: string) {
	const setting = await prisma.systemSettings.findUnique({
		where: { key: ACTIVE_GYM_PROFILE_KEY },
	});
	if (setting && setting.value === id) {
		await prisma.systemSettings.deleteMany({
			where: { key: ACTIVE_GYM_PROFILE_KEY },
		});
	}
	await prisma.gymProfile.delete({ where: { id } });
	revalidatePath("/settings");
	return { success: true };
}

export async function setActiveGymProfile(id: string | null) {
	if (id === null) {
		await prisma.systemSettings.deleteMany({
			where: { key: ACTIVE_GYM_PROFILE_KEY },
		});
	} else {
		await prisma.systemSettings.upsert({
			where: { key: ACTIVE_GYM_PROFILE_KEY },
			create: { key: ACTIVE_GYM_PROFILE_KEY, value: id },
			update: { value: id },
		});
	}
	revalidatePath("/settings");
	revalidatePath("/billing/invoices");
	revalidatePath("/");
	return { success: true };
}
