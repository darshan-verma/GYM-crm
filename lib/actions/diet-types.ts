"use server";

import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getDietTypes() {
	return await prisma.dietType.findMany({
		orderBy: { name: "asc" },
	});
}

export async function createDietType(data: {
	name: string;
	description?: string;
}) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");

	const existing = await prisma.dietType.findUnique({
		where: { name: data.name },
	});

	if (existing) {
		throw new Error("Diet type with this name already exists");
	}

	return await prisma.dietType.create({
		data: {
			name: data.name,
			description: data.description,
		},
	});
}

export async function deleteDietType(id: string) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");

	const dietType = await prisma.dietType.findUnique({
		where: { id },
	});

	if (!dietType) {
		throw new Error("Diet type not found");
	}

	if (dietType.isDefault) {
		throw new Error("Cannot delete default diet types");
	}

	// Check if diet type is being used
	const usageCount = await prisma.dietPlan.count({
		where: { dietTypeId: id },
	});

	if (usageCount > 0) {
		throw new Error("Cannot delete diet type that is being used by diet plans");
	}

	await prisma.dietType.delete({
		where: { id },
	});

	revalidatePath("/diets");
}

export async function seedDefaultDietTypes() {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");

	const defaultTypes = [
		{
			name: "Weight Loss",
			description: "Calorie deficit diet for weight reduction",
		},
		{
			name: "Muscle Gain",
			description: "High protein diet for muscle building",
		},
		{
			name: "Maintenance",
			description: "Balanced diet to maintain current weight",
		},
		{ name: "Keto", description: "Low-carb, high-fat ketogenic diet" },
		{ name: "Vegetarian", description: "Plant-based diet excluding meat" },
	];

	for (const type of defaultTypes) {
		const existing = await prisma.dietType.findUnique({
			where: { name: type.name },
		});

		if (!existing) {
			await prisma.dietType.create({
				data: {
					...type,
					isDefault: true,
				},
			});
		}
	}
}
