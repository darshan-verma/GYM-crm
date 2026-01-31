"use server";

import prisma from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { Permission } from "@prisma/client";

export type RoleWithPermissions = {
	id: string;
	name: string;
	description: string | null;
	defaultPermissions: Permission[];
	createdAt: Date;
	updatedAt: Date;
};

export async function getRoles(): Promise<RoleWithPermissions[]> {
	const session = await auth();
	if (
		!session ||
		(session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")
	) {
		return [];
	}

	const roles = await prisma.role.findMany({
		orderBy: { name: "asc" },
	});
	return roles;
}

export async function createRole(data: {
	name: string;
	description?: string;
	defaultPermissions?: Permission[];
}) {
	const session = await auth();
	if (
		!session ||
		(session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")
	) {
		throw new Error("Unauthorized");
	}

	const existing = await prisma.role.findUnique({
		where: { name: data.name.trim() },
	});

	if (existing) {
		throw new Error("A role with this name already exists");
	}

	const role = await prisma.role.create({
		data: {
			name: data.name.trim(),
			description: data.description?.trim() || null,
			defaultPermissions: data.defaultPermissions || [],
		},
	});

	revalidatePath("/staff");
	revalidatePath("/staff/new");
	return role;
}
