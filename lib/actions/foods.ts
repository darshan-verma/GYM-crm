"use server";

import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface FoodItem {
	id?: string;
	name: string;
	calories: number;
	protein: number;
	carbs: number;
	fat: number;
	category: string;
	isDefault?: boolean;
}

export async function getFoods() {
	const foods = await prisma.food.findMany({
		orderBy: { name: "asc" },
	});

	// Convert Decimal objects to plain numbers for client components
	return foods.map((food) => ({
		...food,
		protein: Number(food.protein),
		carbs: Number(food.carbs),
		fat: Number(food.fat),
	}));
}

export async function getFoodCategories() {
	const categories = await prisma.food.findMany({
		select: { category: true },
		distinct: ["category"],
		orderBy: { category: "asc" },
	});

	return categories.map((cat) => cat.category);
}

export async function createFood(data: Omit<FoodItem, "id" | "isDefault">) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");

	const existing = await prisma.food.findUnique({
		where: { name: data.name },
	});

	if (existing) {
		throw new Error("Food with this name already exists");
	}

	return await prisma.food.create({
		data: {
			name: data.name,
			calories: data.calories,
			protein: data.protein,
			carbs: data.carbs,
			fat: data.fat,
			category: data.category,
		},
	});
}

export async function deleteFood(id: string) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");

	const food = await prisma.food.findUnique({
		where: { id },
	});

	if (!food) {
		throw new Error("Food not found");
	}

	if (food.isDefault) {
		throw new Error("Cannot delete default foods");
	}

	await prisma.food.delete({
		where: { id },
	});

	revalidatePath("/diets");
}

export async function seedDefaultFoods() {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");

	const defaultFoods = [
		// Proteins
		{
			name: "Chicken Breast",
			calories: 165,
			protein: 31,
			carbs: 0,
			fat: 3.6,
			category: "PROTEIN",
		},
		{
			name: "Salmon",
			calories: 206,
			protein: 22,
			carbs: 0,
			fat: 13,
			category: "PROTEIN",
		},
		{
			name: "Eggs",
			calories: 155,
			protein: 13,
			carbs: 1.1,
			fat: 11,
			category: "PROTEIN",
		},
		{
			name: "Greek Yogurt",
			calories: 100,
			protein: 10,
			carbs: 6,
			fat: 0.4,
			category: "PROTEIN",
		},
		{
			name: "Tofu",
			calories: 76,
			protein: 8,
			carbs: 1.9,
			fat: 4.8,
			category: "PROTEIN",
		},
		{
			name: "Tuna",
			calories: 132,
			protein: 28,
			carbs: 0,
			fat: 1.3,
			category: "PROTEIN",
		},
		{
			name: "Cottage Cheese",
			calories: 98,
			protein: 11,
			carbs: 3.4,
			fat: 4.3,
			category: "PROTEIN",
		},
		{
			name: "Paneer",
			calories: 265,
			protein: 18,
			carbs: 3.6,
			fat: 20,
			category: "PROTEIN",
		},

		// Carbs
		{
			name: "Brown Rice",
			calories: 112,
			protein: 2.6,
			carbs: 24,
			fat: 0.9,
			category: "CARBS",
		},
		{
			name: "Quinoa",
			calories: 120,
			protein: 4.4,
			carbs: 21,
			fat: 1.9,
			category: "CARBS",
		},
		{
			name: "Oats",
			calories: 389,
			protein: 17,
			carbs: 66,
			fat: 6.9,
			category: "CARBS",
		},
		{
			name: "Sweet Potato",
			calories: 86,
			protein: 1.6,
			carbs: 20,
			fat: 0.1,
			category: "CARBS",
		},
		{
			name: "Whole Wheat Bread",
			calories: 247,
			protein: 13,
			carbs: 41,
			fat: 3.4,
			category: "CARBS",
		},
		{
			name: "Roti",
			calories: 297,
			protein: 11,
			carbs: 53,
			fat: 4.2,
			category: "CARBS",
		},
		{
			name: "Pasta",
			calories: 131,
			protein: 5.1,
			carbs: 25,
			fat: 1.1,
			category: "CARBS",
		},

		// Vegetables
		{
			name: "Broccoli",
			calories: 34,
			protein: 2.8,
			carbs: 7,
			fat: 0.4,
			category: "VEGETABLES",
		},
		{
			name: "Spinach",
			calories: 23,
			protein: 2.9,
			carbs: 3.6,
			fat: 0.4,
			category: "VEGETABLES",
		},
		{
			name: "Carrots",
			calories: 41,
			protein: 0.9,
			carbs: 10,
			fat: 0.2,
			category: "VEGETABLES",
		},
		{
			name: "Tomato",
			calories: 18,
			protein: 0.9,
			carbs: 3.9,
			fat: 0.2,
			category: "VEGETABLES",
		},
		{
			name: "Cucumber",
			calories: 16,
			protein: 0.7,
			carbs: 3.6,
			fat: 0.1,
			category: "VEGETABLES",
		},
		{
			name: "Bell Pepper",
			calories: 31,
			protein: 1,
			carbs: 6,
			fat: 0.3,
			category: "VEGETABLES",
		},
		{
			name: "Cauliflower",
			calories: 25,
			protein: 1.9,
			carbs: 5,
			fat: 0.3,
			category: "VEGETABLES",
		},

		// Fruits
		{
			name: "Apple",
			calories: 52,
			protein: 0.3,
			carbs: 14,
			fat: 0.2,
			category: "FRUITS",
		},
		{
			name: "Banana",
			calories: 89,
			protein: 1.1,
			carbs: 23,
			fat: 0.3,
			category: "FRUITS",
		},
		{
			name: "Orange",
			calories: 47,
			protein: 0.9,
			carbs: 12,
			fat: 0.1,
			category: "FRUITS",
		},
		{
			name: "Mango",
			calories: 60,
			protein: 0.8,
			carbs: 15,
			fat: 0.4,
			category: "FRUITS",
		},
		{
			name: "Berries",
			calories: 57,
			protein: 0.7,
			carbs: 14,
			fat: 0.3,
			category: "FRUITS",
		},

		// Fats
		{
			name: "Almonds",
			calories: 579,
			protein: 21,
			carbs: 22,
			fat: 50,
			category: "FATS",
		},
		{
			name: "Peanut Butter",
			calories: 588,
			protein: 25,
			carbs: 20,
			fat: 50,
			category: "FATS",
		},
		{
			name: "Olive Oil",
			calories: 884,
			protein: 0,
			carbs: 0,
			fat: 100,
			category: "FATS",
		},
		{
			name: "Avocado",
			calories: 160,
			protein: 2,
			carbs: 9,
			fat: 15,
			category: "FATS",
		},
		{
			name: "Walnuts",
			calories: 654,
			protein: 15,
			carbs: 14,
			fat: 65,
			category: "FATS",
		},
		{
			name: "Cashews",
			calories: 553,
			protein: 18,
			carbs: 30,
			fat: 44,
			category: "FATS",
		},

		// Snacks
		{
			name: "Protein Bar",
			calories: 200,
			protein: 20,
			carbs: 25,
			fat: 8,
			category: "SNACKS",
		},
		{
			name: "Protein Shake",
			calories: 120,
			protein: 24,
			carbs: 3,
			fat: 1.5,
			category: "SNACKS",
		},
		{
			name: "Hummus",
			calories: 166,
			protein: 8,
			carbs: 14,
			fat: 10,
			category: "SNACKS",
		},
		{
			name: "Dark Chocolate",
			calories: 598,
			protein: 8,
			carbs: 46,
			fat: 43,
			category: "SNACKS",
		},
	];

	for (const food of defaultFoods) {
		const existing = await prisma.food.findUnique({
			where: { name: food.name },
		});

		if (!existing) {
			await prisma.food.create({
				data: {
					...food,
					isDefault: true,
				},
			});
		}
	}
}
