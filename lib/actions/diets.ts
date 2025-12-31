"use server";

import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

interface FoodItem {
	foodName: string;
	portion: number;
	unit: string;
}

interface Meal {
	mealTime: string;
	items: FoodItem[];
	calories: number;
	protein: number;
	carbs: number;
	fats: number;
	notes: string;
}

export async function getDietPlans(memberId?: string) {
	const where: Record<string, unknown> = {};

	if (memberId) {
		where.memberId = memberId;
	}

	return await prisma.dietPlan.findMany({
		where,
		include: {
			member: {
				select: {
					id: true,
					name: true,
					membershipNumber: true,
				},
			},
		},
		orderBy: { createdAt: "desc" },
	});
}

export async function getDietPlan(id: string) {
	return await prisma.dietPlan.findUnique({
		where: { id },
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
		},
	});
}

export async function createDietPlan(data: {
	memberId: string;
	name: string;
	description?: string;
	meals: Meal[];
	calorieTarget?: number;
	proteinTarget?: number;
	carbTarget?: number;
	fatTarget?: number;
	dietType?: string;
	startDate?: Date;
	endDate?: Date;
}) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");

	try {
		// Calculate total macros from meals
		let totalCalories = 0;
		let totalProtein = 0;

		// Import food database for calculations
		const { foodDatabase } = await import("@/lib/data/food-database");

		data.meals.forEach((meal: Meal) => {
			const foodItems = meal.items;
			foodItems.forEach((foodItem: FoodItem) => {
				const foodName = foodItem.foodName;
				const food = foodDatabase.find((f) => f.name === foodName);
				if (food) {
					let multiplier = foodItem.portion || 1;

					// Handle unit conversions
					switch (foodItem.unit) {
						case "serving":
							multiplier = foodItem.portion || 1;
							break;
						case "grams":
							multiplier = (foodItem.portion || 100) / 100;
							break;
						case "cup":
							multiplier = (foodItem.portion || 1) * 2;
							break;
						case "piece":
							multiplier = foodItem.portion || 1;
							break;
						default:
							multiplier = foodItem.portion || 1;
					}

					totalCalories += food.calories * multiplier;
					totalProtein += food.protein * multiplier;
				}
			});
		});

		await prisma.dietPlan.create({
			data: {
				memberId: data.memberId,
				name: data.name,
				description: data.description,
				meals: data.meals as unknown as Prisma.InputJsonValue,
				totalCalories: Math.round(totalCalories) || data.calorieTarget,
				totalProtein: Math.round(totalProtein) || data.proteinTarget,
				goal: data.dietType,
				startDate: data.startDate,
				endDate: data.endDate,
			},
		});

		await prisma.activityLog.create({
			data: {
				userId: session.user.id,
				action: "CREATE_DIET_PLAN",
				entity: "DIET_PLAN",
				entityId: data.memberId,
				details: `Created diet plan: ${data.name}`,
			},
		});

		revalidatePath("/diets");
		revalidatePath(`/members/${data.memberId}`);
		return { success: true };
	} catch (_error) {
		return { success: false, error: "Failed to create diet plan" };
	}
}

export async function updateDietPlan(
	id: string,
	data: {
		name: string;
		description?: string;
		meals: Meal[];
		calorieTarget?: number;
		proteinTarget?: number;
		carbTarget?: number;
		fatTarget?: number;
		dietType?: string;
		startDate?: Date;
		endDate?: Date;
		active?: boolean;
	}
) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");

	try {
		const plan = await prisma.dietPlan.update({
			where: { id },
			data: {
				name: data.name,
				description: data.description,
				meals: data.meals as unknown as Prisma.InputJsonValue,
				totalCalories: data.calorieTarget,
				totalProtein: data.proteinTarget,
				goal: data.dietType,
				startDate: data.startDate,
				endDate: data.endDate,
				active: data.active,
			},
		});

		await prisma.activityLog.create({
			data: {
				userId: session.user.id,
				action: "UPDATE_DIET_PLAN",
				entity: "DIET_PLAN",
				entityId: plan.memberId,
				details: `Updated diet plan: ${data.name}`,
			},
		});

		revalidatePath("/diets");
		revalidatePath(`/diets/${id}`);
		revalidatePath(`/members/${plan.memberId}`);
		return { success: true };
	} catch (_error) {
		return { success: false, error: "Failed to update diet plan" };
	}
}

export async function deleteDietPlan(id: string) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");

	try {
		const plan = await prisma.dietPlan.delete({
			where: { id },
		});

		await prisma.activityLog.create({
			data: {
				userId: session.user.id,
				action: "DELETE_DIET_PLAN",
				entity: "DIET_PLAN",
				entityId: plan.memberId,
				details: `Deleted diet plan: ${plan.name}`,
			},
		});

		revalidatePath("/diets");
		revalidatePath(`/members/${plan.memberId}`);
		return { success: true };
	} catch (_error) {
		return { success: false, error: "Failed to delete diet plan" };
	}
}
