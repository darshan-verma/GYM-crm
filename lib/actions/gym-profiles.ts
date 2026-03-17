"use server";

import prisma from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import type { GymProfile } from "@prisma/client";
import type { Session } from "next-auth";

const ACTIVE_GYM_PROFILE_KEY = "activeGymProfileId";

export type GymProfileFormData = {
	name: string;
	description?: string;
	address?: string;
	phone?: string;
	email?: string;
	logoUrl?: string | null;
	watermarkUrl?: string | null;
	adminUsername?: string;
	adminPassword?: string;
	/** When editing: admin login email (optional update) */
	adminEmail?: string;
};

export async function getGymProfiles(): Promise<GymProfile[]> {
	const profiles = await prisma.gymProfile.findMany({
		orderBy: { name: "asc" },
	});
	return profiles;
}

export async function getGymProfilesPaginated(params?: {
	search?: string;
	page?: number;
	limit?: number;
}): Promise<{
	profiles: GymProfile[];
	total: number;
	pages: number;
	currentPage: number;
}> {
	const { search, page = 1, limit = 20 } = params || {};

	const where: {
		OR?: Array<
			| { name: { contains: string; mode: "insensitive" } }
			| { email: { contains: string; mode: "insensitive" } }
			| { phone: { contains: string } }
		>;
	} = {};

	if (search?.trim()) {
		const q = search.trim();
		where.OR = [
			{ name: { contains: q, mode: "insensitive" } },
			{ email: { contains: q, mode: "insensitive" } },
			{ phone: { contains: q } },
		];
	}

	const [profiles, total] = await Promise.all([
		prisma.gymProfile.findMany({
			where,
			orderBy: { name: "asc" },
			skip: (page - 1) * limit,
			take: limit,
		}),
		prisma.gymProfile.count({ where }),
	]);

	return {
		profiles,
		total,
		pages: Math.max(1, Math.ceil(total / limit)),
		currentPage: page,
	};
}

export async function getActiveGymProfile(): Promise<GymProfile | null> {
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

/** Returns the first ADMIN user for a gym profile (for pre-filling edit form). */
export async function getGymProfileAdminUser(profileId: string): Promise<{
	email: string;
	username: string | null;
} | null> {
	const user = await prisma.user.findFirst({
		where: { gymProfileId: profileId, role: "ADMIN" },
		select: { email: true, username: true },
	});
	return user ? { email: user.email, username: user.username } : null;
}

// Resolve the "current" gym profile for a request based on the session.
// - Gym-scoped users: use their linked gymProfileId (from session or fresh from DB)
// - SUPER_ADMIN: fall back to the globally active gym profile setting
// - ADMIN without gymProfileId: fallback match by user email to gym profile email (e.g. existing gym admins)
export async function getCurrentGymProfile(
	session: Session | null
): Promise<GymProfile | null> {
	// 1) Use gymProfileId from session if present
	let gymId: string | null = session?.user?.gymProfileId ?? null;

	// 2) For ADMIN, if no gym in session, refresh from DB (handles old JWTs or backfilled gymProfileId)
	if (!gymId && session?.user?.id && session?.user?.role === "ADMIN") {
		const dbUser = await prisma.user.findUnique({
			where: { id: session.user.id },
		});
		gymId = dbUser?.gymProfileId ?? null;
	}

	if (gymId) {
		const gym = await prisma.gymProfile.findUnique({
			where: { id: gymId },
		});
		if (gym) return gym;
	}

	if (session?.user?.role === "SUPER_ADMIN") {
		return getActiveGymProfile();
	}

	// 3) Fallback for gym admins created before user.gymProfileId existed: match by email
	if (session?.user?.role === "ADMIN" && session.user.email) {
		const gymByEmail = await prisma.gymProfile.findFirst({
			where: { email: { equals: session.user.email, mode: "insensitive" } },
		});
		if (gymByEmail) return gymByEmail;
	}

	return null;
}

export async function requireCurrentGymProfileId(
	session: Session | null
): Promise<string> {
	const gym = await getCurrentGymProfile(session);
	if (!gym?.id) {
		throw new Error("No gym profile selected for this user");
	}
	return gym.id;
}

export async function createGymProfile(data: GymProfileFormData) {
	const profile = await prisma.gymProfile.create({
		data: {
			name: data.name.trim(),
			description: data.description?.trim() || null,
			address: data.address?.trim() || null,
			phone: data.phone?.trim() || null,
			email: data.email?.trim() || null,
			logoUrl: data.logoUrl?.trim() || null,
			watermarkUrl: data.watermarkUrl?.trim() || null,
		},
	});

	// Create initial admin user for this gym profile
	if (data.adminUsername && data.adminPassword) {
		const bcrypt = await import("bcryptjs");
		const hashedPassword = await bcrypt.hash(data.adminPassword, 10);

		try {
			await prisma.user.create({
				data: {
					email:
						data.email?.trim() ||
						`${data.adminUsername.trim()}+${profile.id}@example.com`,
					username: data.adminUsername.trim(),
					password: hashedPassword,
					name: `${profile.name} Admin`,
					role: "ADMIN",
					active: true,
					gymProfileId: profile.id,
				},
			});
		} catch (error) {
			console.error("Failed to create gym admin user:", error);
			// We intentionally do not fail the whole operation if user creation fails.
		}
	}

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
			logoUrl: data.logoUrl !== undefined ? (data.logoUrl?.trim() || null) : undefined,
			watermarkUrl: data.watermarkUrl !== undefined ? (data.watermarkUrl?.trim() || null) : undefined,
		},
	});

	const updateAdminCredentials =
		(data.adminEmail !== undefined && data.adminEmail.trim() !== "") ||
		data.adminUsername !== undefined ||
		(data.adminPassword !== undefined && data.adminPassword.trim() !== "");

	if (updateAdminCredentials) {
		const adminUser = await prisma.user.findFirst({
			where: { gymProfileId: id, role: "ADMIN" },
		});
		if (adminUser) {
			const updateData: { email?: string; username?: string | null; password?: string } = {};
			if (data.adminEmail?.trim()) updateData.email = data.adminEmail.trim();
			if (data.adminUsername !== undefined) updateData.username = data.adminUsername.trim() || null;
			if (data.adminPassword?.trim()) {
				const bcrypt = await import("bcryptjs");
				updateData.password = await bcrypt.hash(data.adminPassword.trim(), 10);
			}
			if (Object.keys(updateData).length > 0) {
				await prisma.user.update({
					where: { id: adminUser.id },
					data: updateData,
				});
			}
		}
	}

	revalidatePath("/settings");
	revalidatePath("/");
	revalidatePath("/billing/invoices");
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
