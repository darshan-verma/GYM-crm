"use server";

import prisma from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function getFitnessGoals() {
	return await prisma.fitnessGoal.findMany({
		orderBy: { name: "asc" },
	});
}

export async function createFitnessGoal(data: {
	name: string;
	description?: string;
}) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");

	const existingGoal = await prisma.fitnessGoal.findUnique({
		where: { name: data.name },
	});

	if (existingGoal) {
		throw new Error("Fitness goal with this name already exists");
	}

	const goal = await prisma.fitnessGoal.create({
		data: {
			name: data.name,
			description: data.description,
			isDefault: false,
		},
	});

	revalidatePath("/workouts");
	revalidatePath("/diets");

	return goal;
}

export async function deleteFitnessGoal(id: string) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");

	const goal = await prisma.fitnessGoal.findUnique({
		where: { id },
	});

	if (!goal) {
		throw new Error("Fitness goal not found");
	}

	if (goal.isDefault) {
		throw new Error("Cannot delete default fitness goals");
	}

	// Check if goal is being used by workout plans
	const workoutUsageCount = await prisma.workoutPlan.count({
		where: { goalId: id },
	});

	if (workoutUsageCount > 0) {
		throw new Error(
			"Cannot delete fitness goal that is being used by workout plans"
		);
	}

	await prisma.fitnessGoal.delete({
		where: { id },
	});

	revalidatePath("/workouts");

	return { success: true };
}

export async function seedDefaultFitnessGoals() {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");

	const defaultGoals = [
		{
			name: "Weight Loss",
			description: "Lose body weight and reduce body fat",
		},
		{ name: "Muscle Gain", description: "Build muscle mass and strength" },
		{
			name: "Endurance",
			description: "Improve cardiovascular fitness and stamina",
		},
		{
			name: "Maintenance",
			description: "Maintain current weight and fitness level",
		},
		{
			name: "General Fitness",
			description: "Overall health and fitness improvement",
		},
	];

	for (const goal of defaultGoals) {
		await prisma.fitnessGoal.upsert({
			where: { name: goal.name },
			update: {},
			create: {
				name: goal.name,
				description: goal.description,
				isDefault: true,
			},
		});
	}

	return { success: true };
}
