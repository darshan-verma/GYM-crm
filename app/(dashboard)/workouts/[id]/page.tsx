import { getWorkoutPlan } from "@/lib/actions/workouts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, User, Calendar, Dumbbell, Clock, Edit } from "lucide-react";
import { notFound } from "next/navigation";

interface Exercise {
	name: string;
	notes?: string;
	sets?: number;
	reps?: number;
	weight?: number;
	restTime?: number;
}

export default async function WorkoutPlanDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const plan = await getWorkoutPlan(id);

	if (!plan) {
		notFound();
	}

	const getDifficultyColor = (difficulty: string | null) => {
		switch (difficulty) {
			case "BEGINNER":
				return "bg-green-100 text-green-800";
			case "INTERMEDIATE":
				return "bg-yellow-100 text-yellow-800";
			case "ADVANCED":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getGoalColor = (goal: string | null) => {
		switch (goal) {
			case "WEIGHT_LOSS":
				return "bg-blue-100 text-blue-800";
			case "MUSCLE_GAIN":
				return "bg-purple-100 text-purple-800";
			case "ENDURANCE":
				return "bg-orange-100 text-orange-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-start">
				<div>
					<Link
						href="/workouts"
						className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
					>
						<ArrowLeft className="h-4 w-4 mr-1" />
						Back to Workout Plans
					</Link>
					<h1 className="text-3xl font-bold">{plan.name}</h1>
					<div className="flex items-center gap-3 mt-2">
						<Link
							href={`/members/${plan.member.id}`}
							className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
						>
							<User className="h-4 w-4" />
							{plan.member.name}
						</Link>
						{!plan.active && (
							<Badge variant="outline" className="bg-gray-100">
								Inactive
							</Badge>
						)}
					</div>
				</div>
				<Link href={`/workouts/${plan.id}/edit`}>
					<Button>
						<Edit className="h-4 w-4 mr-2" />
						Edit Plan
					</Button>
				</Link>
			</div>

			<div className="grid gap-6 md:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium text-gray-600">
							Difficulty
						</CardTitle>
					</CardHeader>
					<CardContent>
						{plan.difficulty && (
							<Badge className={getDifficultyColor(plan.difficulty)}>
								{plan.difficulty}
							</Badge>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium text-gray-600">
							Goal
						</CardTitle>
					</CardHeader>
					<CardContent>
						{plan.goal && (
							<Badge className={getGoalColor(plan.goal)}>
								{plan.goal.replace("_", " ")}
							</Badge>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium text-gray-600">
							Duration
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2 text-sm">
							<Calendar className="h-4 w-4 text-gray-500" />
							<span>
								{new Date(plan.startDate).toLocaleDateString()}
								{plan.endDate &&
									` - ${new Date(plan.endDate).toLocaleDateString()}`}
							</span>
						</div>
					</CardContent>
				</Card>
			</div>

			{plan.description && (
				<Card>
					<CardHeader>
						<CardTitle>Description</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-gray-600">{plan.description}</p>
					</CardContent>
				</Card>
			)}

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Dumbbell className="h-5 w-5" />
						Exercises ({(plan.exercises as unknown as Exercise[]).length})
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{(plan.exercises as unknown as Exercise[]).map(
							(exercise, index) => (
								<div
									key={index}
									className="p-4 border rounded-lg hover:border-blue-300 transition-colors"
								>
									<div className="flex items-start justify-between mb-3">
										<div>
											<h4 className="font-semibold text-lg">
												{index + 1}. {exercise.name}
											</h4>
											{exercise.notes && (
												<p className="text-sm text-gray-600 mt-1">
													{exercise.notes}
												</p>
											)}
										</div>
									</div>

									<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
										<div>
											<span className="text-gray-600">Sets:</span>
											<p className="font-semibold">{exercise.sets}</p>
										</div>
										<div>
											<span className="text-gray-600">Reps:</span>
											<p className="font-semibold">{exercise.reps}</p>
										</div>
										<div>
											<span className="text-gray-600">Weight:</span>
											<p className="font-semibold">{exercise.weight} kg</p>
										</div>
										<div>
											<span className="text-gray-600">Rest:</span>
											<p className="font-semibold flex items-center gap-1">
												<Clock className="h-3 w-3" />
												{exercise.restTime}s
											</p>
										</div>
									</div>
								</div>
							)
						)}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Member Information</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						<div className="flex justify-between">
							<span className="text-gray-600">Name:</span>
							<Link
								href={`/members/${plan.member.id}`}
								className="font-medium hover:text-blue-600"
							>
								{plan.member.name}
							</Link>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600">Member ID:</span>
							<span className="font-medium">
								{plan.member.membershipNumber}
							</span>
						</div>
						{plan.member.email && (
							<div className="flex justify-between">
								<span className="text-gray-600">Email:</span>
								<span className="font-medium">{plan.member.email}</span>
							</div>
						)}
						{plan.member.phone && (
							<div className="flex justify-between">
								<span className="text-gray-600">Phone:</span>
								<span className="font-medium">{plan.member.phone}</span>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
