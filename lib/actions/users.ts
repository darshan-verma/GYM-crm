"use server";

import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { Permission } from "@prisma/client";

export async function getUsers() {
	const session = await auth();
	if (
		!session ||
		(session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")
	) {
		throw new Error("Unauthorized");
	}

	return await prisma.user.findMany({
		orderBy: { createdAt: "desc" },
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			permissions: true,
			phone: true,
			createdAt: true,
		},
	});
}

export async function getUser(id: string) {
	const session = await auth();
	if (
		!session ||
		(session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")
	) {
		throw new Error("Unauthorized");
	}

	return await prisma.user.findUnique({
		where: { id },
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			permissions: true,
			phone: true,
			createdAt: true,
		},
	});
}

export async function createUser(data: {
	name: string;
	email: string;
	password: string;
	role: "SUPER_ADMIN" | "ADMIN" | "TRAINER" | "RECEPTIONIST" | "HELPER";
	permissions?: Permission[];
	phone?: string;
}) {
	const session = await auth();
	if (!session) {
		throw new Error("Unauthorized");
	}

	// Only super admins can create admin or super admin accounts
	if (
		(data.role === "ADMIN" || data.role === "SUPER_ADMIN") &&
		session.user.role !== "SUPER_ADMIN"
	) {
		throw new Error("Unauthorized to create admin accounts");
	}

	// Regular admins can only create trainer and receptionist accounts
	if (
		session.user.role === "ADMIN" &&
		(data.role === "SUPER_ADMIN" || data.role === "ADMIN")
	) {
		throw new Error("Unauthorized to create admin accounts");
	}

	try {
		// Check if email already exists
		const existingUser = await prisma.user.findUnique({
			where: { email: data.email },
		});

		if (existingUser) {
			return { success: false, error: "Email already in use" };
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(data.password, 10);

		const user = await prisma.user.create({
			data: {
				name: data.name,
				email: data.email,
				password: hashedPassword,
				role: data.role,
				phone: data.phone,
				permissions: data.permissions || [],
			},
		});

		// Log activity
		await prisma.activityLog.create({
			data: {
				userId: session.user.id,
				action: "CREATE_USER",
				entity: "USER",
				entityId: user.id,
				details: `Created user: ${user.name} (${user.email})`,
			},
		});

		revalidatePath("/staff");
		return { success: true, data: user };
	} catch (_error) {
		return { success: false, error: "Failed to create user" };
	}
}

export async function updateUser(
	id: string,
	data: {
		name: string;
		email: string;
		role: "SUPER_ADMIN" | "ADMIN" | "TRAINER" | "RECEPTIONIST" | "HELPER";
		permissions?: Permission[];
		phone?: string;
		password?: string;
	}
) {
	const session = await auth();
	if (
		!session ||
		(session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")
	) {
		throw new Error("Unauthorized");
	}

	// Only super admins can change roles to admin or super admin
	if (
		(data.role === "ADMIN" || data.role === "SUPER_ADMIN") &&
		session.user.role !== "SUPER_ADMIN"
	) {
		throw new Error("Unauthorized to assign admin roles");
	}

	// Regular admins cannot change roles to admin or super admin
	if (
		session.user.role === "ADMIN" &&
		(data.role === "ADMIN" || data.role === "SUPER_ADMIN")
	) {
		throw new Error("Unauthorized to assign admin roles");
	}

	try {
		// Check if email is taken by another user
		if (data.email) {
			const existingUser = await prisma.user.findUnique({
				where: { email: data.email },
			});

			if (existingUser && existingUser.id !== id) {
				return { success: false, error: "Email already in use" };
			}
		}

		const updateData: Record<string, unknown> = {
			name: data.name,
			email: data.email,
			role: data.role,
			phone: data.phone,
			permissions: data.permissions,
		};

		// Only update password if provided
		if (data.password) {
			updateData.password = await bcrypt.hash(data.password, 10);
		}

		const user = await prisma.user.update({
			where: { id },
			data: updateData,
		});

		// Log activity
		await prisma.activityLog.create({
			data: {
				userId: session.user.id,
				action: "UPDATE_USER",
				entity: "USER",
				entityId: user.id,
				details: `Updated user: ${user.name}`,
			},
		});

		revalidatePath("/staff");
		revalidatePath(`/staff/${id}/edit`);
		return { success: true, data: user };
	} catch (_error) {
		return { success: false, error: "Failed to update user" };
	}
}

export async function deleteUser(id: string) {
	const session = await auth();
	if (
		!session ||
		(session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")
	) {
		throw new Error("Unauthorized");
	}

	// Prevent deleting yourself
	if (session.user.id === id) {
		return { success: false, error: "Cannot delete your own account" };
	}

	// Get the user being deleted to check their role
	const userToDelete = await prisma.user.findUnique({
		where: { id },
	});

	if (!userToDelete) {
		return { success: false, error: "User not found" };
	}

	// Regular admins cannot delete admin or super admin accounts
	if (
		session.user.role === "ADMIN" &&
		(userToDelete.role === "ADMIN" || userToDelete.role === "SUPER_ADMIN")
	) {
		throw new Error("Unauthorized to delete admin accounts");
	}

	try {
		const user = await prisma.user.findUnique({
			where: { id },
		});

		if (!user) {
			return { success: false, error: "User not found" };
		}

		await prisma.user.delete({
			where: { id },
		});

		// Log activity
		await prisma.activityLog.create({
			data: {
				userId: session.user.id,
				action: "DELETE_USER",
				entity: "USER",
				entityId: id,
				details: `Deleted user: ${user.name} (${user.email})`,
			},
		});

		revalidatePath("/staff");
		return { success: true };
	} catch (_error) {
		return { success: false, error: "Failed to delete user" };
	}
}
