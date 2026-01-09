"use server";

import prisma from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export interface ExerciseItem {
	id?: string;
	name: string;
	category: string;
	equipment: string;
	difficulty: string;
	isDefault?: boolean;
}

export async function getExercises() {
	const exercises = await prisma.exercise.findMany({
		orderBy: { name: "asc" },
	});

	return exercises;
}

export async function getExerciseCategories() {
	const categories = await prisma.exercise.findMany({
		select: { category: true },
		distinct: ["category"],
		orderBy: { category: "asc" },
	});

	return categories.map((cat) => cat.category);
}

export async function createExercise(data: Omit<ExerciseItem, "id" | "isDefault">) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");

	const existing = await prisma.exercise.findUnique({
		where: { name: data.name },
	});

	if (existing) {
		throw new Error("Exercise with this name already exists");
	}

	const exercise = await prisma.exercise.create({
		data: {
			name: data.name,
			category: data.category,
			equipment: data.equipment,
			difficulty: data.difficulty,
		},
	});

	revalidatePath("/workouts");

	return exercise;
}

export async function deleteExercise(id: string) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");

	const exercise = await prisma.exercise.findUnique({
		where: { id },
	});

	if (!exercise) {
		throw new Error("Exercise not found");
	}

	if (exercise.isDefault) {
		throw new Error("Cannot delete default exercises");
	}

	await prisma.exercise.delete({
		where: { id },
	});

	revalidatePath("/workouts");
}

export async function seedDefaultExercises() {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");

	// Import the static exercise library
	const { exerciseLibrary } = await import("@/lib/data/exercise-library");

	for (const exercise of exerciseLibrary) {
		await prisma.exercise.upsert({
			where: { name: exercise.name },
			update: {},
			create: {
				name: exercise.name,
				category: exercise.category,
				equipment: exercise.equipment,
				difficulty: exercise.difficulty,
				isDefault: true,
			},
		});
	}

	return { success: true };
}
