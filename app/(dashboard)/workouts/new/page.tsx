import { WorkoutForm } from "@/components/forms/WorkoutForm";
import prisma from "@/lib/db/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getExercises } from "@/lib/actions/exercises";

export default async function NewWorkoutPlanPage() {
	const members = await prisma.member.findMany({
		where: {
			status: "ACTIVE",
		},
		select: {
			id: true,
			name: true,
			membershipNumber: true,
		},
		orderBy: { name: "asc" },
	});

	const fitnessGoals = await prisma.fitnessGoal.findMany({
		orderBy: { name: "asc" },
	});

	// Transform fitnessGoals to match the expected interface
	const transformedFitnessGoals = fitnessGoals.map((goal) => ({
		...goal,
		description: goal.description || undefined,
	}));

	// Fetch exercises from database
	const exercises = await getExercises();

	return (
		<div className="space-y-6">
			<div>
				<Link
					href="/workouts"
					className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
				>
					<ArrowLeft className="h-4 w-4 mr-1" />
					Back to Workout Plans
				</Link>
				<h1 className="text-3xl font-bold">Create Workout Plan</h1>
				<p className="text-gray-600 mt-1">
					Design a custom workout program for your member
				</p>
			</div>

			<div className="bg-white p-6 rounded-lg shadow">
				<WorkoutForm
					members={members}
					fitnessGoals={transformedFitnessGoals}
					exercises={exercises}
				/>
			</div>
		</div>
	);
}
